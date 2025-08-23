"""
Bargain Engine Models for Faredown
AI-powered bargaining system with session control
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
import enum
from datetime import datetime, timedelta

class BargainStatus(enum.Enum):
    """Bargain session status options"""
    ACTIVE = "active"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"
    ABANDONED = "abandoned"

class BargainAttemptType(enum.Enum):
    """Types of bargain attempts"""
    USER_OFFER = "user_offer"
    AI_COUNTER = "ai_counter"
    FINAL_OFFER = "final_offer"

class BargainSession(BaseModel):
    """Main bargain session tracking for 10-minute sessions"""
    
    __tablename__ = "bargain_sessions"
    
    # Session Identification
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Booking Details
    booking_type = Column(String(20), nullable=False)  # 'flight' or 'hotel'
    item_id = Column(String(100), nullable=False)  # flight_id or hotel_id
    item_data = Column(JSON, nullable=False)  # Full item details for reference
    
    # Pricing Information
    net_rate = Column(Float, nullable=False)  # Supplier net rate
    markup_min = Column(Float, nullable=False)  # Minimum markup %
    markup_max = Column(Float, nullable=False)  # Maximum markup %
    base_price = Column(Float, nullable=False)  # Net rate + markup
    promo_discount = Column(Float, default=0.0, nullable=False)  # Promo discount
    final_price_range_min = Column(Float, nullable=False)  # Minimum acceptable
    final_price_range_max = Column(Float, nullable=False)  # Maximum price
    
    # Session Control
    status = Column(Enum(BargainStatus), default=BargainStatus.ACTIVE, nullable=False)
    started_at = Column(DateTime, server_default=func.now(), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    # Bargain Tracking
    total_attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=3, nullable=False)
    user_best_offer = Column(Float, nullable=True)
    ai_best_counter = Column(Float, nullable=True)
    agreed_price = Column(Float, nullable=True)
    
    # AI Analytics
    ai_confidence_score = Column(Float, nullable=True)  # AI confidence in pricing
    price_sensitivity = Column(Float, nullable=True)  # User price sensitivity
    conversion_probability = Column(Float, nullable=True)  # Likelihood to book
    
    # Metadata
    user_ip = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    referrer = Column(String(500), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="bargain_sessions")
    attempts = relationship("BargainAttempt", back_populates="session", order_by="BargainAttempt.created_at")
    counter_offers = relationship("CounterOffer", back_populates="session")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set expiration to 10 minutes from creation
        if not self.expires_at:
            self.expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    @property
    def is_expired(self) -> bool:
        """Check if session has expired"""
        return datetime.utcnow() > self.expires_at
    
    @property
    def time_remaining(self) -> int:
        """Get remaining time in seconds"""
        if self.is_expired:
            return 0
        delta = self.expires_at - datetime.utcnow()
        return max(0, int(delta.total_seconds()))
    
    @property
    def can_bargain(self) -> bool:
        """Check if user can make another bargain attempt"""
        return (
            not self.is_expired and 
            self.status == BargainStatus.ACTIVE and
            self.total_attempts < self.max_attempts
        )
    
    def is_price_acceptable(self, offer_price: float) -> bool:
        """Check if offer price is within acceptable range"""
        return self.final_price_range_min <= offer_price <= self.final_price_range_max

class BargainAttempt(BaseModel):
    """Individual bargain attempts within a session"""
    
    __tablename__ = "bargain_attempts"
    
    session_id = Column(Integer, ForeignKey("bargain_sessions.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    
    # Attempt Details
    attempt_type = Column(Enum(BargainAttemptType), nullable=False)
    offered_price = Column(Float, nullable=False)
    previous_price = Column(Float, nullable=True)  # Previous offer for context
    
    # Response Details
    is_accepted = Column(Boolean, default=False, nullable=False)
    response_time_seconds = Column(Integer, nullable=True)  # AI response time
    
    # AI Decision Data
    ai_reasoning = Column(Text, nullable=True)  # Why AI made this decision
    margin_analysis = Column(JSON, nullable=True)  # Profit margin calculations
    market_comparison = Column(JSON, nullable=True)  # Market price comparison
    user_behavior_score = Column(Float, nullable=True)  # User behavior analysis
    
    # Context Information
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)
    user_message = Column(Text, nullable=True)  # Optional user message
    
    # Relationship
    session = relationship("BargainSession", back_populates="attempts")

class CounterOffer(BaseModel):
    """AI-generated counter offers"""
    
    __tablename__ = "counter_offers"
    
    session_id = Column(Integer, ForeignKey("bargain_sessions.id"), nullable=False)
    attempt_id = Column(Integer, ForeignKey("bargain_attempts.id"), nullable=True)
    
    # Counter Offer Details
    counter_price = Column(Float, nullable=False)
    original_offer = Column(Float, nullable=False)
    discount_amount = Column(Float, nullable=False)
    discount_percentage = Column(Float, nullable=False)
    
    # AI Strategy
    strategy_type = Column(String(50), nullable=False)  # 'aggressive', 'moderate', 'conservative'
    ai_message = Column(Text, nullable=True)  # Message to user
    incentives = Column(JSON, nullable=True)  # Additional incentives offered
    
    # Validity
    valid_until = Column(DateTime, nullable=False)
    is_final_offer = Column(Boolean, default=False, nullable=False)
    
    # Performance Tracking
    was_accepted = Column(Boolean, default=False, nullable=False)
    user_response_time = Column(Integer, nullable=True)  # Seconds to respond
    
    # AI Analytics
    confidence_level = Column(Float, nullable=False)  # AI confidence 0-1
    expected_acceptance_rate = Column(Float, nullable=True)  # Predicted acceptance
    profit_margin = Column(Float, nullable=False)  # Expected profit margin
    
    # Relationship
    session = relationship("BargainSession", back_populates="counter_offers")
    
    @property
    def is_expired(self) -> bool:
        """Check if counter offer has expired"""
        return datetime.utcnow() > self.valid_until
    
    def calculate_savings(self) -> dict:
        """Calculate savings information for display"""
        savings_amount = self.original_offer - self.counter_price
        savings_percentage = (savings_amount / self.original_offer) * 100
        
        return {
            "savings_amount": round(savings_amount, 2),
            "savings_percentage": round(savings_percentage, 2),
            "final_price": round(self.counter_price, 2),
            "original_price": round(self.original_offer, 2)
        }
