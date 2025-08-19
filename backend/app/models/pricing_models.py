"""
Pricing Models for Faredown
Markup, currency, VAT, and fee management
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from .base import BaseModel

class Markup(BaseModel):
    """Markup configuration for different routes/suppliers"""
    
    __tablename__ = "markups"
    
    booking_type = Column(String(20), nullable=False)  # flight, hotel
    origin = Column(String(100), nullable=True)
    destination = Column(String(100), nullable=True)
    supplier = Column(String(100), nullable=True)
    markup_percentage_min = Column(Float, nullable=False)
    markup_percentage_max = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

class Currency(BaseModel):
    """Supported currencies and exchange rates"""
    
    __tablename__ = "currencies"
    
    code = Column(String(3), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    symbol = Column(String(10), nullable=False)
    exchange_rate = Column(Float, nullable=False)  # Rate to base currency (INR)
    is_active = Column(Boolean, default=True, nullable=False)
    last_updated = Column(DateTime, nullable=True)

class VAT(BaseModel):
    """VAT rates for different booking types"""
    
    __tablename__ = "vat_rates"
    
    booking_type = Column(String(50), nullable=False)
    country = Column(String(100), nullable=True)
    vat_percentage = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

class ConvenienceFee(BaseModel):
    """Convenience fees configuration"""
    
    __tablename__ = "convenience_fees"
    
    booking_type = Column(String(50), nullable=False)
    fee_type = Column(String(20), nullable=False)  # flat, percentage
    fee_amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
