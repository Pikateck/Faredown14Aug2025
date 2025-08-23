"""
Report Models for Faredown
Analytics and reporting data models
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from .base import BaseModel

class BookingReport(BaseModel):
    """Booking analytics reports"""
    
    __tablename__ = "booking_reports"
    
    # Report Metadata
    report_date = Column(DateTime, nullable=False)
    report_period = Column(String(20), nullable=False)  # daily, weekly, monthly
    
    # Booking Metrics
    total_bookings = Column(Integer, default=0, nullable=False)
    confirmed_bookings = Column(Integer, default=0, nullable=False)
    cancelled_bookings = Column(Integer, default=0, nullable=False)
    pending_bookings = Column(Integer, default=0, nullable=False)
    
    # Revenue Metrics
    total_revenue = Column(Float, default=0.0, nullable=False)
    average_booking_value = Column(Float, default=0.0, nullable=False)
    
    # Booking Type Breakdown
    flight_bookings = Column(Integer, default=0, nullable=False)
    hotel_bookings = Column(Integer, default=0, nullable=False)
    package_bookings = Column(Integer, default=0, nullable=False)
    
    # Bargain Metrics
    bargain_bookings = Column(Integer, default=0, nullable=False)
    total_bargain_savings = Column(Float, default=0.0, nullable=False)
    
    # Additional Data
    top_destinations = Column(JSON, nullable=True)
    booking_sources = Column(JSON, nullable=True)  # website, mobile, api

class RevenueReport(BaseModel):
    """Revenue analytics reports"""
    
    __tablename__ = "revenue_reports"
    
    # Report Metadata
    report_date = Column(DateTime, nullable=False)
    report_period = Column(String(20), nullable=False)
    
    # Revenue Breakdown
    gross_revenue = Column(Float, default=0.0, nullable=False)
    net_revenue = Column(Float, default=0.0, nullable=False)
    commission_earned = Column(Float, default=0.0, nullable=False)
    convenience_fees = Column(Float, default=0.0, nullable=False)
    
    # Cost Analysis
    supplier_costs = Column(Float, default=0.0, nullable=False)
    operational_costs = Column(Float, default=0.0, nullable=False)
    marketing_costs = Column(Float, default=0.0, nullable=False)
    
    # Profitability
    gross_profit = Column(Float, default=0.0, nullable=False)
    profit_margin = Column(Float, default=0.0, nullable=False)
    
    # Currency Breakdown
    revenue_by_currency = Column(JSON, nullable=True)
    
    # Payment Method Analysis
    revenue_by_payment_method = Column(JSON, nullable=True)

class UserReport(BaseModel):
    """User analytics reports"""
    
    __tablename__ = "user_reports"
    
    # Report Metadata
    report_date = Column(DateTime, nullable=False)
    report_period = Column(String(20), nullable=False)
    
    # User Metrics
    total_users = Column(Integer, default=0, nullable=False)
    new_users = Column(Integer, default=0, nullable=False)
    active_users = Column(Integer, default=0, nullable=False)
    returning_users = Column(Integer, default=0, nullable=False)
    
    # Engagement Metrics
    average_session_duration = Column(Float, default=0.0, nullable=False)  # minutes
    bounce_rate = Column(Float, default=0.0, nullable=False)  # percentage
    pages_per_session = Column(Float, default=0.0, nullable=False)
    
    # User Journey
    conversion_rate = Column(Float, default=0.0, nullable=False)  # percentage
    average_time_to_booking = Column(Float, default=0.0, nullable=False)  # hours
    
    # Demographics
    user_demographics = Column(JSON, nullable=True)  # age, location, etc.
    device_usage = Column(JSON, nullable=True)  # mobile, desktop percentages
    
    # Retention Metrics
    retention_rate_7_day = Column(Float, default=0.0, nullable=False)
    retention_rate_30_day = Column(Float, default=0.0, nullable=False)
    
    # User Value
    lifetime_value = Column(Float, default=0.0, nullable=False)
    average_revenue_per_user = Column(Float, default=0.0, nullable=False)
