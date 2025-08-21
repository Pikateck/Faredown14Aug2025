"""
Promo Code Models for Faredown
Promo codes and usage tracking
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class PromoCode(BaseModel):
    """Promo code configuration"""
    
    __tablename__ = "promo_codes"
    
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Discount Configuration
    discount_type = Column(String(20), nullable=False)  # percentage, fixed
    discount_value = Column(Float, nullable=False)
    max_discount_amount = Column(Float, nullable=True)
    
    # Usage Limits
    usage_limit = Column(Integer, nullable=True)  # Total usage limit
    usage_limit_per_user = Column(Integer, default=1, nullable=False)
    current_usage = Column(Integer, default=0, nullable=False)
    
    # Validity
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    
    # Conditions
    min_booking_amount = Column(Float, nullable=True)
    applicable_booking_types = Column(JSON, nullable=True)  # List of booking types
    applicable_routes = Column(JSON, nullable=True)  # Specific routes
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    usage_records = relationship("PromoUsage", back_populates="promo_code")

class PromoUsage(BaseModel):
    """Promo code usage tracking"""
    
    __tablename__ = "promo_usage"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    promo_code_id = Column(Integer, ForeignKey("promo_codes.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    
    # Usage Details
    discount_amount = Column(Float, nullable=False)
    booking_amount = Column(Float, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="promo_usage")
    promo_code = relationship("PromoCode", back_populates="usage_records")
