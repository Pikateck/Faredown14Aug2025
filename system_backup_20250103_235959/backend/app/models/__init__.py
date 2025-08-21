"""
Faredown Database Models
All SQLAlchemy models for the booking platform
"""

from .base import Base
from .user_models import User, UserProfile, UserSession
from .booking_models import Booking, BookingItem, Payment
from .flight_models import Flight, Airline, Airport, FlightBooking
from .hotel_models import Hotel, Room, HotelBooking, HotelAmenity
from .bargain_models import BargainSession, BargainAttempt, CounterOffer
from .admin_models import AdminUser, AdminSession, AuditLog
from .pricing_models import Markup, Currency, VAT, ConvenienceFee
from .promo_models import PromoCode, PromoUsage
from .cms_models import CMSContent, Banner, Destination
from .extranet_models import ExtranetHotel, ExtranetFlight, ExtranetDeal
from .ai_models import AIRecommendation, AIAnalytics, AILog
from .report_models import BookingReport, RevenueReport, UserReport

__all__ = [
    # Base
    "Base",
    
    # User Models
    "User", "UserProfile", "UserSession",
    
    # Booking Models
    "Booking", "BookingItem", "Payment",
    
    # Flight Models
    "Flight", "Airline", "Airport", "FlightBooking",
    
    # Hotel Models
    "Hotel", "Room", "HotelBooking", "HotelAmenity",
    
    # Bargain Models
    "BargainSession", "BargainAttempt", "CounterOffer",
    
    # Admin Models
    "AdminUser", "AdminSession", "AuditLog",
    
    # Pricing Models
    "Markup", "Currency", "VAT", "ConvenienceFee",
    
    # Promo Models
    "PromoCode", "PromoUsage",
    
    # CMS Models
    "CMSContent", "Banner", "Destination",
    
    # Extranet Models
    "ExtranetHotel", "ExtranetFlight", "ExtranetDeal",
    
    # AI Models
    "AIRecommendation", "AIAnalytics", "AILog",
    
    # Report Models
    "BookingReport", "RevenueReport", "UserReport",
]
