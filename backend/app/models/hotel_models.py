"""
Hotel Models for Faredown
Hotels, rooms, amenities, and hotel bookings
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class Hotel(BaseModel):
    """Hotel information and details"""
    
    __tablename__ = "hotels"
    
    # Hotel Identification
    name = Column(String(200), nullable=False)
    brand = Column(String(100), nullable=True)  # e.g., "Marriott", "Hilton"
    
    # Location
    address_line1 = Column(String(200), nullable=False)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=True)
    
    # Geographic Coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Hotel Details
    star_rating = Column(Integer, nullable=True)  # 1-5 stars
    description = Column(Text, nullable=True)
    check_in_time = Column(String(10), default="15:00", nullable=False)
    check_out_time = Column(String(10), default="11:00", nullable=False)
    
    # Contact Information
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Media
    main_image_url = Column(String(500), nullable=True)
    gallery_images = Column(JSON, nullable=True)  # List of image URLs
    
    # Operational Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Policies
    cancellation_policy = Column(Text, nullable=True)
    pet_policy = Column(Text, nullable=True)
    child_policy = Column(Text, nullable=True)
    
    # Relationships
    rooms = relationship("Room", back_populates="hotel")
    amenities = relationship("HotelAmenity", back_populates="hotel")
    hotel_bookings = relationship("HotelBooking", back_populates="hotel")

class Room(BaseModel):
    """Hotel room types and details"""
    
    __tablename__ = "rooms"
    
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    
    # Room Details
    name = Column(String(200), nullable=False)  # e.g., "Deluxe Room", "Presidential Suite"
    room_type = Column(String(50), nullable=False)  # single, double, suite, etc.
    description = Column(Text, nullable=True)
    
    # Room Specifications
    max_occupancy = Column(Integer, default=2, nullable=False)
    bed_type = Column(String(50), nullable=True)  # king, queen, twin, etc.
    bed_count = Column(Integer, default=1, nullable=False)
    room_size_sqm = Column(Float, nullable=True)
    
    # Pricing
    base_price_per_night = Column(Float, nullable=False)
    weekend_surcharge = Column(Float, default=0.0, nullable=False)
    peak_season_surcharge = Column(Float, default=0.0, nullable=False)
    
    # Room Features
    has_balcony = Column(Boolean, default=False, nullable=False)
    has_sea_view = Column(Boolean, default=False, nullable=False)
    has_city_view = Column(Boolean, default=False, nullable=False)
    has_mountain_view = Column(Boolean, default=False, nullable=False)
    has_wifi = Column(Boolean, default=True, nullable=False)
    has_ac = Column(Boolean, default=True, nullable=False)
    has_tv = Column(Boolean, default=True, nullable=False)
    has_minibar = Column(Boolean, default=False, nullable=False)
    has_safe = Column(Boolean, default=False, nullable=False)
    
    # Amenities (JSON list)
    amenities = Column(JSON, nullable=True)  # List of room-specific amenities
    
    # Media
    main_image_url = Column(String(500), nullable=True)
    gallery_images = Column(JSON, nullable=True)  # List of image URLs
    
    # Availability
    total_rooms = Column(Integer, default=1, nullable=False)
    available_rooms = Column(Integer, default=1, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    hotel = relationship("Hotel", back_populates="rooms")
    hotel_bookings = relationship("HotelBooking", back_populates="room")

class HotelAmenity(BaseModel):
    """Hotel amenities and facilities"""
    
    __tablename__ = "hotel_amenities"
    
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    
    # Amenity Details
    name = Column(String(100), nullable=False)  # e.g., "Swimming Pool", "Spa"
    category = Column(String(50), nullable=False)  # wellness, dining, business, etc.
    description = Column(Text, nullable=True)
    
    # Availability
    is_free = Column(Boolean, default=True, nullable=False)
    additional_cost = Column(Float, nullable=True)
    operating_hours = Column(String(100), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    hotel = relationship("Hotel", back_populates="amenities")

class HotelBooking(BaseModel):
    """Hotel-specific booking details"""
    
    __tablename__ = "hotel_bookings"
    
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    
    # Stay Details
    check_in_date = Column(DateTime, nullable=False)
    check_out_date = Column(DateTime, nullable=False)
    total_nights = Column(Integer, nullable=False)
    
    # Guest Information
    guest_count = Column(Integer, default=1, nullable=False)
    adult_count = Column(Integer, default=1, nullable=False)
    child_count = Column(Integer, default=0, nullable=False)
    guest_details = Column(JSON, nullable=False)  # List of guest info
    
    # Room Details
    room_count = Column(Integer, default=1, nullable=False)
    room_numbers = Column(JSON, nullable=True)  # Assigned room numbers
    
    # Services and Preferences
    meal_plan = Column(String(20), default="room_only", nullable=False)  # room_only, breakfast, half_board, full_board
    special_requests = Column(Text, nullable=True)
    early_checkin_requested = Column(Boolean, default=False, nullable=False)
    late_checkout_requested = Column(Boolean, default=False, nullable=False)
    
    # Booking Reference
    hotel_confirmation = Column(String(50), nullable=True)
    voucher_number = Column(String(50), nullable=True)
    
    # Check-in Status
    is_checked_in = Column(Boolean, default=False, nullable=False)
    actual_checkin_time = Column(DateTime, nullable=True)
    is_checked_out = Column(Boolean, default=False, nullable=False)
    actual_checkout_time = Column(DateTime, nullable=True)
    
    # Additional Services
    airport_transfer_required = Column(Boolean, default=False, nullable=False)
    spa_services = Column(JSON, nullable=True)  # Booked spa services
    
    # Relationships
    booking = relationship("Booking", back_populates="hotel_booking")
    hotel = relationship("Hotel", back_populates="hotel_bookings")
    room = relationship("Room", back_populates="hotel_bookings")
