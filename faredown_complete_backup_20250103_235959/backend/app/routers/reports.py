"""Analytics and Reports API Router for Faredown"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, func
from sqlalchemy import and_, desc
from typing import Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models.booking_models import Booking, Payment, BookingStatus, PaymentStatus
from app.models.bargain_models import BargainSession, BargainStatus
from app.routers.auth import get_current_user
from app.models.user_models import User

router = APIRouter()

@router.get("/revenue")
async def get_revenue_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get revenue analytics report"""
    
    # Default to last 30 days if no dates provided
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
    if not end_date:
        end_date = datetime.utcnow().date().isoformat()
    
    start_datetime = datetime.fromisoformat(start_date)
    end_datetime = datetime.fromisoformat(end_date) + timedelta(days=1)
    
    # Total revenue
    total_revenue_result = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.COMPLETED,
        Payment.completed_at >= start_datetime,
        Payment.completed_at < end_datetime
    ).scalar()
    
    total_revenue = float(total_revenue_result or 0)
    
    # Revenue by booking type
    revenue_by_type = db.query(
        Booking.booking_type,
        func.sum(Payment.amount).label('revenue'),
        func.count(Payment.id).label('transactions')
    ).join(Payment).filter(
        Payment.status == PaymentStatus.COMPLETED,
        Payment.completed_at >= start_datetime,
        Payment.completed_at < end_datetime
    ).group_by(Booking.booking_type).all()
    
    # Daily revenue trend
    daily_revenue = db.query(
        func.date(Payment.completed_at).label('date'),
        func.sum(Payment.amount).label('revenue'),
        func.count(Payment.id).label('transactions')
    ).filter(
        Payment.status == PaymentStatus.COMPLETED,
        Payment.completed_at >= start_datetime,
        Payment.completed_at < end_datetime
    ).group_by(func.date(Payment.completed_at)).order_by('date').all()
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_revenue": total_revenue,
            "total_transactions": sum(r.transactions for r in revenue_by_type),
            "average_transaction_value": total_revenue / max(sum(r.transactions for r in revenue_by_type), 1)
        },
        "revenue_by_type": [
            {
                "booking_type": r.booking_type,
                "revenue": float(r.revenue),
                "transactions": r.transactions,
                "percentage": (float(r.revenue) / max(total_revenue, 1)) * 100
            }
            for r in revenue_by_type
        ],
        "daily_trend": [
            {
                "date": r.date.isoformat(),
                "revenue": float(r.revenue),
                "transactions": r.transactions
            }
            for r in daily_revenue
        ]
    }

@router.get("/bookings")
async def get_booking_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    booking_type: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get booking analytics report"""
    
    # Default to last 30 days
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
    if not end_date:
        end_date = datetime.utcnow().date().isoformat()
    
    start_datetime = datetime.fromisoformat(start_date)
    end_datetime = datetime.fromisoformat(end_date) + timedelta(days=1)
    
    # Base query
    query = db.query(Booking).filter(
        Booking.created_at >= start_datetime,
        Booking.created_at < end_datetime
    )
    
    if booking_type:
        query = query.filter(Booking.booking_type == booking_type)
    
    # Total bookings
    total_bookings = query.count()
    
    # Bookings by status
    status_distribution = db.query(
        Booking.status,
        func.count(Booking.id).label('count')
    ).filter(
        Booking.created_at >= start_datetime,
        Booking.created_at < end_datetime
    ).group_by(Booking.status).all()
    
    # Bargain vs regular bookings
    bargain_stats = db.query(
        Booking.was_bargained,
        func.count(Booking.id).label('count'),
        func.avg(Booking.bargain_savings).label('avg_savings')
    ).filter(
        Booking.created_at >= start_datetime,
        Booking.created_at < end_datetime
    ).group_by(Booking.was_bargained).all()
    
    # Top destinations (mock data)
    top_destinations = [
        {"destination": "Dubai", "bookings": 45, "revenue": 750000},
        {"destination": "Singapore", "bookings": 32, "revenue": 580000},
        {"destination": "London", "bookings": 28, "revenue": 920000}
    ]
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date,
            "booking_type": booking_type
        },
        "summary": {
            "total_bookings": total_bookings,
            "confirmed_bookings": sum(s.count for s in status_distribution if s.status == BookingStatus.CONFIRMED),
            "cancelled_bookings": sum(s.count for s in status_distribution if s.status == BookingStatus.CANCELLED)
        },
        "status_distribution": [
            {
                "status": s.status.value,
                "count": s.count,
                "percentage": (s.count / max(total_bookings, 1)) * 100
            }
            for s in status_distribution
        ],
        "bargain_analysis": [
            {
                "type": "bargained" if b.was_bargained else "regular",
                "count": b.count,
                "average_savings": float(b.avg_savings or 0) if b.was_bargained else 0
            }
            for b in bargain_stats
        ],
        "top_destinations": top_destinations
    }

@router.get("/bargain-performance")
async def get_bargain_performance_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get bargain engine performance report"""
    
    # Default to last 30 days
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
    if not end_date:
        end_date = datetime.utcnow().date().isoformat()
    
    start_datetime = datetime.fromisoformat(start_date)
    end_datetime = datetime.fromisoformat(end_date) + timedelta(days=1)
    
    # Total bargain sessions
    total_sessions = db.query(BargainSession).filter(
        BargainSession.created_at >= start_datetime,
        BargainSession.created_at < end_datetime
    ).count()
    
    # Success rate by status
    session_stats = db.query(
        BargainSession.status,
        func.count(BargainSession.id).label('count')
    ).filter(
        BargainSession.created_at >= start_datetime,
        BargainSession.created_at < end_datetime
    ).group_by(BargainSession.status).all()
    
    successful_sessions = sum(s.count for s in session_stats if s.status == BargainStatus.ACCEPTED)
    success_rate = (successful_sessions / max(total_sessions, 1)) * 100
    
    # Average savings
    avg_savings_result = db.query(
        func.avg(BargainSession.base_price - BargainSession.agreed_price)
    ).filter(
        BargainSession.created_at >= start_datetime,
        BargainSession.created_at < end_datetime,
        BargainSession.status == BargainStatus.ACCEPTED,
        BargainSession.agreed_price.isnot(None)
    ).scalar()
    
    avg_savings = float(avg_savings_result or 0)
    
    # Performance by booking type
    performance_by_type = db.query(
        BargainSession.booking_type,
        func.count(BargainSession.id).label('total'),
        func.sum(func.case([(BargainSession.status == BargainStatus.ACCEPTED, 1)], else_=0)).label('successful')
    ).filter(
        BargainSession.created_at >= start_datetime,
        BargainSession.created_at < end_datetime
    ).group_by(BargainSession.booking_type).all()
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_sessions": total_sessions,
            "successful_sessions": successful_sessions,
            "success_rate": round(success_rate, 2),
            "average_savings": round(avg_savings, 2)
        },
        "session_distribution": [
            {
                "status": s.status.value,
                "count": s.count,
                "percentage": (s.count / max(total_sessions, 1)) * 100
            }
            for s in session_stats
        ],
        "performance_by_type": [
            {
                "booking_type": p.booking_type,
                "total_sessions": p.total,
                "successful_sessions": p.successful,
                "success_rate": (p.successful / max(p.total, 1)) * 100
            }
            for p in performance_by_type
        ]
    }

@router.get("/user-analytics")
async def get_user_analytics_report(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user analytics report"""
    
    # Default to last 30 days
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).date().isoformat()
    if not end_date:
        end_date = datetime.utcnow().date().isoformat()
    
    start_datetime = datetime.fromisoformat(start_date)
    end_datetime = datetime.fromisoformat(end_date) + timedelta(days=1)
    
    # New user registrations
    new_users = db.query(func.count(User.id)).filter(
        User.created_at >= start_datetime,
        User.created_at < end_datetime
    ).scalar()
    
    # User growth by day
    daily_registrations = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('new_users')
    ).filter(
        User.created_at >= start_datetime,
        User.created_at < end_datetime
    ).group_by(func.date(User.created_at)).order_by('date').all()
    
    # User activity metrics (mock data for comprehensive report)
    user_metrics = {
        "total_active_users": 2456,
        "retention_rate": 78.5,
        "average_session_duration": "12m 30s",
        "bounce_rate": 23.2
    }
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "new_users": new_users,
            **user_metrics
        },
        "daily_registrations": [
            {
                "date": r.date.isoformat(),
                "new_users": r.new_users
            }
            for r in daily_registrations
        ]
    }

@router.get("/export/{report_type}")
async def export_report(
    report_type: str,
    format: str = Query("csv", regex="^(csv|excel|pdf)$"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    admin_user: User = Depends(get_current_user)
):
    """Export report in specified format"""
    
    # In production, generate actual file and return download link
    export_url = f"https://reports.faredown.com/exports/{report_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{format}"
    
    return {
        "message": f"Report export initiated for {report_type}",
        "format": format,
        "download_url": export_url,
        "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
    }
