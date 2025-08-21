"""
User Management API Router for Faredown
User profiles, settings, and account management
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.models.user_models import User, UserProfile, UserSession
from app.routers.auth import get_current_user

router = APIRouter()

# Pydantic models
class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    preferred_currency: Optional[str] = None
    preferred_language: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    date_of_birth: Optional[datetime]
    gender: Optional[str]
    preferred_currency: str
    preferred_language: str
    is_verified: bool
    is_premium: bool
    last_login: Optional[datetime]
    created_at: datetime

class ExtendedProfileUpdate(BaseModel):
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    passport_number: Optional[str] = None
    passport_expiry: Optional[datetime] = None
    passport_country: Optional[str] = None
    bio: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

class NotificationSettings(BaseModel):
    email_notifications: bool = True
    sms_notifications: bool = False
    push_notifications: bool = True
    marketing_consent: bool = False

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    return current_user

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's basic profile information"""
    
    # Update user fields
    update_data = profile_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/profile/extended")
async def get_extended_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's extended profile information"""
    
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        # Create profile if it doesn't exist
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return {
        "user_id": profile.user_id,
        "address_line1": profile.address_line1,
        "address_line2": profile.address_line2,
        "city": profile.city,
        "state": profile.state,
        "country": profile.country,
        "postal_code": profile.postal_code,
        "passport_number": profile.passport_number,
        "passport_expiry": profile.passport_expiry,
        "passport_country": profile.passport_country,
        "bio": profile.bio,
        "profile_picture_url": profile.profile_picture_url,
        "emergency_contact_name": profile.emergency_contact_name,
        "emergency_contact_phone": profile.emergency_contact_phone,
        "total_bookings": profile.total_bookings,
        "total_spent": profile.total_spent,
        "countries_visited": profile.countries_visited,
        "favorite_destinations": profile.favorite_destinations,
        "frequent_flyer_numbers": profile.frequent_flyer_numbers,
        "email_notifications": profile.email_notifications,
        "sms_notifications": profile.sms_notifications,
        "push_notifications": profile.push_notifications
    }

@router.put("/profile/extended")
async def update_extended_profile(
    profile_data: ExtendedProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's extended profile information"""
    
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update profile fields
    update_data = profile_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    return {"message": "Extended profile updated successfully"}

@router.put("/notifications")
async def update_notification_settings(
    settings: NotificationSettings,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's notification preferences"""
    
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    # Update notification settings
    profile.email_notifications = settings.email_notifications
    profile.sms_notifications = settings.sms_notifications
    profile.push_notifications = settings.push_notifications
    
    # Update marketing consent on user model
    current_user.marketing_consent = settings.marketing_consent
    
    db.commit()
    
    return {"message": "Notification settings updated successfully"}

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user's password"""
    
    # Verify current password
    if not current_user.check_password(password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Verify new password confirmation
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match"
        )
    
    # Password strength validation (basic)
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )
    
    # Update password
    current_user.set_password(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user's profile picture"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed"
        )
    
    # Validate file size (5MB max)
    max_size = 5 * 1024 * 1024  # 5MB
    file_content = await file.read()
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    # In production, upload to cloud storage (AWS S3, CloudFront, etc.)
    # For now, return a mock URL
    profile_picture_url = f"https://storage.faredown.com/profiles/{current_user.id}/{file.filename}"
    
    # Update user profile
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.profile_picture_url = profile_picture_url
    db.commit()
    
    return {
        "message": "Profile picture uploaded successfully",
        "profile_picture_url": profile_picture_url
    }

@router.get("/sessions")
async def get_user_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's active sessions"""
    
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).order_by(UserSession.last_activity.desc()).all()
    
    return [
        {
            "id": session.id,
            "device_type": session.device_type,
            "browser": session.browser,
            "platform": session.platform,
            "ip_address": session.ip_address,
            "country": session.country,
            "city": session.city,
            "last_activity": session.last_activity,
            "created_at": session.created_at,
            "is_current": session.session_token  # In production, check current token
        }
        for session in sessions
    ]

@router.delete("/sessions/{session_id}")
async def terminate_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Terminate a specific session"""
    
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session.is_active = False
    db.commit()
    
    return {"message": "Session terminated successfully"}

@router.post("/terminate-all-sessions")
async def terminate_all_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Terminate all user sessions (except current)"""
    
    # In production, you'd exclude the current session
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).update({"is_active": False})
    
    db.commit()
    
    return {"message": "All sessions terminated successfully"}

@router.get("/statistics")
async def get_user_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's booking and travel statistics"""
    
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Calculate additional stats from bookings
    from app.models.booking_models import Booking, BookingStatus
    
    total_bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.COMPLETED])
    ).count()
    
    total_spent_result = db.query(func.sum(Booking.total_amount)).filter(
        Booking.user_id == current_user.id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.COMPLETED])
    ).scalar()
    
    total_spent = float(total_spent_result or 0)
    
    # Update profile with calculated values
    profile.total_bookings = total_bookings
    profile.total_spent = int(total_spent * 100)  # Store in cents
    
    db.commit()
    
    return {
        "total_bookings": total_bookings,
        "total_spent": total_spent,
        "countries_visited": len(profile.countries_visited or []),
        "favorite_destinations": profile.favorite_destinations or [],
        "member_since": current_user.created_at,
        "is_premium": current_user.is_premium,
        "bargain_savings": 0,  # Would calculate from bargain sessions
        "average_trip_value": round(total_spent / max(total_bookings, 1), 2)
    }

@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user account (soft delete)"""
    
    # Soft delete user account
    current_user.is_active = False
    current_user.is_deleted = True
    current_user.deleted_at = datetime.utcnow()
    
    # Deactivate all sessions
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id
    ).update({"is_active": False})
    
    db.commit()
    
    return {"message": "Account deleted successfully"}
