"""
Extranet Models for Faredown
Manual deal upload system
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from .base import BaseModel

class ExtranetHotel(BaseModel):
    """Manually uploaded hotel deals"""
    
    __tablename__ = "extranet_hotels"
    
    # Hotel Information
    name = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    star_rating = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    
    # Deal Information
    deal_title = Column(String(200), nullable=False)
    room_type = Column(String(100), nullable=False)
    price_per_night = Column(Float, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    
    # Availability
    available_from = Column(DateTime, nullable=False)
    available_until = Column(DateTime, nullable=False)
    blackout_dates = Column(JSON, nullable=True)
    
    # Inclusions and Terms
    inclusions = Column(JSON, nullable=True)  # List of included services
    terms_conditions = Column(Text, nullable=True)
    cancellation_policy = Column(Text, nullable=True)
    
    # Media
    images = Column(JSON, nullable=True)  # List of image URLs
    
    # Status
    status = Column(String(20), default="pending", nullable=False)  # pending, active, inactive
    is_featured = Column(Boolean, default=False, nullable=False)

class ExtranetFlight(BaseModel):
    """Manually uploaded flight deals"""
    
    __tablename__ = "extranet_flights"
    
    # Flight Information
    airline = Column(String(100), nullable=False)
    flight_number = Column(String(20), nullable=True)
    route = Column(String(200), nullable=False)  # "DEL-DXB"
    
    # Deal Information
    deal_title = Column(String(200), nullable=False)
    cabin_class = Column(String(50), default="economy", nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    
    # Schedule
    departure_dates = Column(JSON, nullable=False)  # Available departure dates
    return_dates = Column(JSON, nullable=True)  # For round trips
    blackout_dates = Column(JSON, nullable=True)
    
    # Fare Rules
    baggage_allowance = Column(String(100), nullable=True)
    fare_rules = Column(Text, nullable=True)
    cancellation_charges = Column(Text, nullable=True)
    
    # Status
    status = Column(String(20), default="pending", nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

class ExtranetDeal(BaseModel):
    """General extranet deals (packages, etc.)"""
    
    __tablename__ = "extranet_deals"
    
    # Deal Information
    deal_type = Column(String(50), nullable=False)  # package, activity, transfer
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Pricing
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    price_includes = Column(JSON, nullable=True)
    price_excludes = Column(JSON, nullable=True)
    
    # Validity
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    
    # Location
    destination = Column(String(200), nullable=False)
    pickup_location = Column(String(200), nullable=True)
    
    # Deal Details
    duration = Column(String(100), nullable=True)  # "3 days 2 nights"
    highlights = Column(JSON, nullable=True)  # List of highlights
    itinerary = Column(JSON, nullable=True)  # Day-wise itinerary
    
    # Booking Information
    advance_booking_required = Column(Integer, nullable=True)  # Days
    min_participants = Column(Integer, default=1, nullable=False)
    max_participants = Column(Integer, nullable=True)
    
    # Media
    images = Column(JSON, nullable=True)
    
    # Status
    status = Column(String(20), default="pending", nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
