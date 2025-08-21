"""
Flight Models for Faredown
Airlines, airports, flights, and flight bookings
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class Airline(BaseModel):
    """Airline information"""
    
    __tablename__ = "airlines"
    
    # Airline Details
    iata_code = Column(String(3), unique=True, index=True, nullable=False)  # e.g., "AI", "6E"
    icao_code = Column(String(4), unique=True, index=True, nullable=True)   # e.g., "AIC", "IGO"
    name = Column(String(200), nullable=False)  # e.g., "Air India", "IndiGo"
    country = Column(String(100), nullable=False)
    
    # Operational Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    flights = relationship("Flight", back_populates="airline")

class Airport(BaseModel):
    """Airport information"""
    
    __tablename__ = "airports"
    
    # Airport Details
    iata_code = Column(String(3), unique=True, index=True, nullable=False)  # e.g., "DEL", "BOM"
    icao_code = Column(String(4), unique=True, index=True, nullable=True)   # e.g., "VIDP", "VABB"
    name = Column(String(200), nullable=False)  # e.g., "Indira Gandhi International"
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    timezone = Column(String(50), nullable=True)
    
    # Location
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Operational Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    departing_flights = relationship("Flight", foreign_keys="Flight.origin_airport_id", back_populates="origin_airport")
    arriving_flights = relationship("Flight", foreign_keys="Flight.destination_airport_id", back_populates="destination_airport")

class Flight(BaseModel):
    """Flight information and schedules"""
    
    __tablename__ = "flights"
    
    # Flight Identification
    flight_number = Column(String(10), index=True, nullable=False)  # e.g., "AI101", "6E123"
    airline_id = Column(Integer, ForeignKey("airlines.id"), nullable=False)
    
    # Route Information
    origin_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    destination_airport_id = Column(Integer, ForeignKey("airports.id"), nullable=False)
    
    # Schedule
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    
    # Aircraft Information
    aircraft_type = Column(String(50), nullable=True)  # e.g., "Boeing 737", "Airbus A320"
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    
    # Pricing
    base_price = Column(Float, nullable=False)  # Base fare
    fuel_surcharge = Column(Float, default=0.0, nullable=False)
    airport_tax = Column(Float, default=0.0, nullable=False)
    
    # Flight Details
    flight_type = Column(String(20), default="domestic", nullable=False)  # domestic, international
    meal_service = Column(Boolean, default=False, nullable=False)
    baggage_allowance = Column(Integer, default=15, nullable=False)  # kg
    
    # Status
    status = Column(String(20), default="scheduled", nullable=False)  # scheduled, delayed, cancelled
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    airline = relationship("Airline", back_populates="flights")
    origin_airport = relationship("Airport", foreign_keys=[origin_airport_id], back_populates="departing_flights")
    destination_airport = relationship("Airport", foreign_keys=[destination_airport_id], back_populates="arriving_flights")
    flight_bookings = relationship("FlightBooking", back_populates="flight")

class FlightBooking(BaseModel):
    """Flight-specific booking details"""
    
    __tablename__ = "flight_bookings"
    
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    
    # Passenger Information
    passenger_count = Column(Integer, default=1, nullable=False)
    passenger_details = Column(JSON, nullable=False)  # List of passenger info
    
    # Seat Information
    seat_numbers = Column(JSON, nullable=True)  # List of assigned seats
    seat_preference = Column(String(20), nullable=True)  # window, aisle, middle
    
    # Services
    meal_preference = Column(JSON, nullable=True)  # Per passenger meal choices
    special_assistance = Column(Text, nullable=True)
    extra_baggage_kg = Column(Integer, default=0, nullable=False)
    
    # Booking Reference
    pnr = Column(String(10), unique=True, index=True, nullable=False)  # Passenger Name Record
    airline_confirmation = Column(String(50), nullable=True)
    
    # Check-in Information
    web_checkin_available = Column(Boolean, default=True, nullable=False)
    checkin_opened_at = Column(DateTime, nullable=True)
    is_checked_in = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    booking = relationship("Booking", back_populates="flight_booking")
    flight = relationship("Flight", back_populates="flight_bookings")
