"""
Admin Dashboard API Router for Faredown
Analytics, user management, and system overview
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, func
from sqlalchemy import and_, or_, desc
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, date

from app.database import get_db
from app.models.user_models import User, UserSession
from app.models.booking_models import Booking, Payment, BookingStatus, PaymentStatus
from app.models.bargain_models import BargainSession, BargainStatus
from app.routers.auth import get_current_user

router = APIRouter()

# Pydantic models for responses
class DashboardStats(BaseModel):
    total_users: int
    active_users_today: int
    total_bookings: int
    total_revenue: float
    bargain_sessions_today: int
    successful_bargains: int
    conversion_rate: float

class BookingAnalytics(BaseModel):
    daily_bookings: List[Dict[str, Any]]
    monthly_revenue: List[Dict[str, Any]]
    booking_types: Dict[str, int]
    top_destinations: List[Dict[str, Any]]

class UserAnalytics(BaseModel):
    new_users_today: int
    active_users_online: int
    user_growth: List[Dict[str, Any]]
    user_locations: List[Dict[str, Any]]

class BargainAnalytics(BaseModel):
    total_sessions: int
    successful_sessions: int
    average_savings: float
    strategy_performance: Dict[str, Any]

# Mock admin authentication (in production, implement proper admin roles)
async def get_admin_user(current_user: User = Depends(get_current_user)):
    """Verify admin access (simplified for demo)"""
    # In production, check user role/permissions
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get main dashboard statistics"""
    
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    
    # Total users
    total_users = db.query(User).filter(User.is_active == True).count()
    
    # Active users today (had a session today)
    active_users_today = db.query(UserSession).filter(
        UserSession.created_at >= start_of_day,
        UserSession.is_active == True
    ).distinct(UserSession.user_id).count()
    
    # Total bookings
    total_bookings = db.query(Booking).filter(
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.COMPLETED])
    ).count()
    
    # Total revenue
    total_revenue_result = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.COMPLETED
    ).scalar()
    total_revenue = float(total_revenue_result or 0)
    
    # Bargain sessions today
    bargain_sessions_today = db.query(BargainSession).filter(
        BargainSession.created_at >= start_of_day
    ).count()
    
    # Successful bargains
    successful_bargains = db.query(BargainSession).filter(
        BargainSession.status == BargainStatus.ACCEPTED
    ).count()
    
    # Conversion rate
    total_sessions = db.query(BargainSession).count()
    conversion_rate = (successful_bargains / max(total_sessions, 1)) * 100
    
    return DashboardStats(
        total_users=total_users,
        active_users_today=active_users_today,
        total_bookings=total_bookings,
        total_revenue=total_revenue,
        bargain_sessions_today=bargain_sessions_today,
        successful_bargains=successful_bargains,
        conversion_rate=round(conversion_rate, 2)
    )

@router.get("/bookings/analytics", response_model=BookingAnalytics)
async def get_booking_analytics(
    days: int = Query(30, ge=1, le=365),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get booking analytics for specified period"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Daily bookings for the period
    daily_bookings_query = db.query(
        func.date(Booking.created_at).label('date'),
        func.count(Booking.id).label('count'),
        func.sum(Booking.total_amount).label('revenue')
    ).filter(
        Booking.created_at >= start_date,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.COMPLETED])
    ).group_by(func.date(Booking.created_at)).order_by('date')
    
    daily_bookings = [
        {
            "date": result.date.isoformat(),
            "bookings": result.count,
            "revenue": float(result.revenue or 0)
        }
        for result in daily_bookings_query.all()
    ]
    
    # Monthly revenue (last 12 months)
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    monthly_revenue_query = db.query(
        func.extract('year', Booking.created_at).label('year'),
        func.extract('month', Booking.created_at).label('month'),
        func.sum(Booking.total_amount).label('revenue')
    ).filter(
        Booking.created_at >= twelve_months_ago,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.COMPLETED])
    ).group_by('year', 'month').order_by('year', 'month')
    
    monthly_revenue = [
        {
            "month": f"{int(result.year)}-{int(result.month):02d}",
            "revenue": float(result.revenue or 0)
        }
        for result in monthly_revenue_query.all()
    ]
    
    # Booking types distribution
    booking_types_query = db.query(
        Booking.booking_type,
        func.count(Booking.id).label('count')
    ).filter(
        Booking.created_at >= start_date
    ).group_by(Booking.booking_type)
    
    booking_types = {
        result.booking_type: result.count
        for result in booking_types_query.all()
    }
    
    # Top destinations (mock data for demo)
    top_destinations = [
        {"destination": "Dubai", "bookings": 145, "revenue": 2500000},
        {"destination": "London", "bookings": 98, "revenue": 1800000},
        {"destination": "New York", "bookings": 87, "revenue": 1650000},
        {"destination": "Singapore", "bookings": 76, "revenue": 1400000},
        {"destination": "Bangkok", "bookings": 65, "revenue": 980000}
    ]
    
    return BookingAnalytics(
        daily_bookings=daily_bookings,
        monthly_revenue=monthly_revenue,
        booking_types=booking_types,
        top_destinations=top_destinations
    )

@router.get("/users/analytics", response_model=UserAnalytics)
async def get_user_analytics(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get user analytics and growth metrics"""
    
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    
    # New users today
    new_users_today = db.query(User).filter(
        User.created_at >= start_of_day
    ).count()
    
    # Active users online (with active sessions)
    active_users_online = db.query(UserSession).filter(
        UserSession.is_active == True,
        UserSession.last_activity >= datetime.utcnow() - timedelta(minutes=30)
    ).distinct(UserSession.user_id).count()
    
    # User growth (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    user_growth_query = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('new_users')
    ).filter(
        User.created_at >= thirty_days_ago
    ).group_by(func.date(User.created_at)).order_by('date')
    
    user_growth = [
        {
            "date": result.date.isoformat(),
            "new_users": result.new_users
        }
        for result in user_growth_query.all()
    ]
    
    # User locations (mock data for demo)
    user_locations = [
        {"country": "India", "users": 2456, "percentage": 45.2},
        {"country": "UAE", "users": 892, "percentage": 16.4},
        {"country": "United States", "users": 567, "percentage": 10.4},
        {"country": "United Kingdom", "users": 445, "percentage": 8.2},
        {"country": "Singapore", "users": 334, "percentage": 6.1},
        {"country": "Others", "users": 743, "percentage": 13.7}
    ]
    
    return UserAnalytics(
        new_users_today=new_users_today,
        active_users_online=active_users_online,
        user_growth=user_growth,
        user_locations=user_locations
    )

@router.get("/bargain/analytics", response_model=BargainAnalytics)
async def get_bargain_analytics(
    days: int = Query(30, ge=1, le=365),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get bargain engine analytics"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Total sessions in period
    total_sessions = db.query(BargainSession).filter(
        BargainSession.created_at >= start_date
    ).count()
    
    # Successful sessions
    successful_sessions = db.query(BargainSession).filter(
        BargainSession.created_at >= start_date,
        BargainSession.status == BargainStatus.ACCEPTED
    ).count()
    
    # Average savings
    savings_query = db.query(
        func.avg(BargainSession.base_price - BargainSession.agreed_price)
    ).filter(
        BargainSession.created_at >= start_date,
        BargainSession.status == BargainStatus.ACCEPTED,
        BargainSession.agreed_price.isnot(None)
    ).scalar()
    
    average_savings = float(savings_query or 0)
    
    # Strategy performance (mock data based on AI strategies)
    strategy_performance = {
        "aggressive": {
            "sessions": 156,
            "success_rate": 72.4,
            "avg_savings": 1450.0
        },
        "moderate": {
            "sessions": 298,
            "success_rate": 58.7,
            "avg_savings": 890.0
        },
        "conservative": {
            "sessions": 187,
            "success_rate": 41.2,
            "avg_savings": 520.0
        }
    }
    
    return BargainAnalytics(
        total_sessions=total_sessions,
        successful_sessions=successful_sessions,
        average_savings=round(average_savings, 2),
        strategy_performance=strategy_performance
    )

@router.get("/users/online")
async def get_online_users(
    limit: int = Query(50, ge=1, le=100),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of currently online users"""
    
    # Users with active sessions in last 30 minutes
    cutoff_time = datetime.utcnow() - timedelta(minutes=30)
    
    online_users = db.query(User).join(UserSession).filter(
        UserSession.is_active == True,
        UserSession.last_activity >= cutoff_time
    ).distinct().limit(limit).all()
    
    return [
        {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "last_activity": max([s.last_activity for s in user.sessions if s.is_active]),
            "session_count": len([s for s in user.sessions if s.is_active])
        }
        for user in online_users
    ]

@router.get("/recent-bookings")
async def get_recent_bookings(
    limit: int = Query(20, ge=1, le=100),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get recent bookings for admin monitoring"""
    
    recent_bookings = db.query(Booking).join(User).order_by(
        desc(Booking.created_at)
    ).limit(limit).all()
    
    return [
        {
            "booking_reference": booking.booking_reference,
            "user_name": booking.user.full_name,
            "booking_type": booking.booking_type,
            "total_amount": booking.total_amount,
            "status": booking.status.value,
            "was_bargained": booking.was_bargained,
            "bargain_savings": booking.bargain_savings,
            "created_at": booking.created_at
        }
        for booking in recent_bookings
    ]

@router.get("/system-health")
async def get_system_health(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get system health and performance metrics"""
    
    # Database connection test
    try:
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception:
        db_status = "error"
    
    # Active sessions count
    active_sessions = db.query(UserSession).filter(
        UserSession.is_active == True
    ).count()
    
    # Active bargain sessions
    active_bargains = db.query(BargainSession).filter(
        BargainSession.status == BargainStatus.ACTIVE
    ).count()
    
    return {
        "database": db_status,
        "active_user_sessions": active_sessions,
        "active_bargain_sessions": active_bargains,
        "system_load": "normal",  # Would integrate with actual monitoring
        "memory_usage": "65%",     # Would integrate with actual metrics
        "response_time": "120ms",  # Would integrate with actual metrics
        "uptime": "99.9%",         # Would integrate with actual uptime monitoring
        "last_updated": datetime.utcnow().isoformat()
    }
