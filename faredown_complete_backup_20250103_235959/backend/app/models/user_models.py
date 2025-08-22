"""
User Management Models for Faredown
B2C user tracking, profiles, and authentication
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel, StatusMixin
import bcrypt

class User(BaseModel, StatusMixin):
    """Main user model for B2C customers"""
    
    __tablename__ = "users"
    
    # Basic Information
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    
    # Personal Details
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String(10), nullable=True)
    
    # Account Status
    is_verified = Column(Boolean, default=False, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    phone_verified = Column(Boolean, default=False, nullable=False)
    
    # Login Tracking
    last_login = Column(DateTime, nullable=True)
    login_count = Column(Integer, default=0, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    
    # User Preferences
    preferred_currency = Column(String(3), default="INR", nullable=False)
    preferred_language = Column(String(5), default="en", nullable=False)
    marketing_consent = Column(Boolean, default=False, nullable=False)
    
    # Social Login
    google_id = Column(String(255), nullable=True, index=True)
    facebook_id = Column(String(255), nullable=True, index=True)
    apple_id = Column(String(255), nullable=True, index=True)
    
    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    sessions = relationship("UserSession", back_populates="user")
    bookings = relationship("Booking", back_populates="user")
    bargain_sessions = relationship("BargainSession", back_populates="user")
    promo_usage = relationship("PromoUsage", back_populates="user")
    
    def set_password(self, password: str):
        """Hash and set user password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Verify user password"""
        return bcrypt.checkpw(
            password.encode('utf-8'), 
            self.password_hash.encode('utf-8')
        )
    
    @property
    def full_name(self) -> str:
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_online(self) -> bool:
        """Check if user is currently online"""
        active_sessions = [s for s in self.sessions if s.is_active]
        return len(active_sessions) > 0

class UserProfile(BaseModel):
    """Extended user profile information"""
    
    __tablename__ = "user_profiles"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Contact Information
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    
    # Travel Preferences
    passport_number = Column(String(50), nullable=True)
    passport_expiry = Column(DateTime, nullable=True)
    passport_country = Column(String(100), nullable=True)
    frequent_flyer_numbers = Column(JSON, nullable=True)  # {"airline": "number"}
    
    # Profile Details
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    emergency_contact_name = Column(String(200), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    
    # Travel Statistics
    total_bookings = Column(Integer, default=0, nullable=False)
    total_spent = Column(Integer, default=0, nullable=False)  # In cents
    countries_visited = Column(JSON, nullable=True)  # List of country codes
    favorite_destinations = Column(JSON, nullable=True)  # List of destinations
    
    # Notifications
    email_notifications = Column(Boolean, default=True, nullable=False)
    sms_notifications = Column(Boolean, default=False, nullable=False)
    push_notifications = Column(Boolean, default=True, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="profile")

class UserSession(BaseModel):
    """User session tracking for online status"""
    
    __tablename__ = "user_sessions"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, index=True, nullable=False)
    
    # Session Details
    ip_address = Column(String(45), nullable=True)  # IPv6 support
    user_agent = Column(Text, nullable=True)
    device_type = Column(String(50), nullable=True)  # mobile, desktop, tablet
    browser = Column(String(100), nullable=True)
    platform = Column(String(100), nullable=True)
    
    # Location Data
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    timezone = Column(String(50), nullable=True)
    
    # Session Status
    is_active = Column(Boolean, default=True, nullable=False)
    last_activity = Column(DateTime, server_default=func.now(), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="sessions")
    
    def is_expired(self) -> bool:
        """Check if session is expired"""
        from datetime import datetime
        return datetime.utcnow() > self.expires_at
    
    def refresh_activity(self):
        """Update last activity timestamp"""
        self.last_activity = func.now()
