"""Currency Management API Router for Faredown"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/rates")
async def get_exchange_rates():
    """Get current exchange rates"""
    return {
        "base_currency": "INR",
        "rates": {
            "USD": 0.012,
            "EUR": 0.011,
            "GBP": 0.0095,
            "AED": 0.044,
            "SGD": 0.016
        },
        "last_updated": "2024-07-20T10:00:00Z"
    }

@router.get("/supported")
async def get_supported_currencies():
    """Get list of supported currencies"""
    return {
        "currencies": [
            {"code": "INR", "name": "Indian Rupee", "symbol": "₹"},
            {"code": "USD", "name": "US Dollar", "symbol": "$"},
            {"code": "EUR", "name": "Euro", "symbol": "€"},
            {"code": "GBP", "name": "British Pound", "symbol": "£"},
            {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ"},
            {"code": "SGD", "name": "Singapore Dollar", "symbol": "S$"}
        ]
    }
