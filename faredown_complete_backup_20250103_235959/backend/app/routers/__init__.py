"""
API Routers for Faredown Backend
All API endpoints organized by functionality
"""

# Import all routers for easy access
from . import (
    admin, auth, users, bookings, 
    airlines, hotels, bargain, promo,
    currency, vat, cms, extranet,
    ai, reports
)

__all__ = [
    "admin", "auth", "users", "bookings",
    "airlines", "hotels", "bargain", "promo", 
    "currency", "vat", "cms", "extranet",
    "ai", "reports"
]
