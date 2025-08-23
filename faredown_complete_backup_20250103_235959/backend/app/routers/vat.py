"""VAT and Fees API Router for Faredown"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/rates")
async def get_vat_rates():
    """Get VAT rates for different booking types"""
    return {
        "vat_rates": {
            "flight_domestic": 5.0,
            "flight_international": 0.0,
            "hotel_domestic": 12.0,
            "hotel_international": 0.0
        },
        "convenience_fees": {
            "flight_domestic": 25.0,
            "flight_international": 50.0,
            "hotel_domestic": 35.0,
            "hotel_international": 65.0
        }
    }

@router.get("/calculate")
async def calculate_fees(booking_type: str, base_amount: float):
    """Calculate VAT and fees for booking"""
    rates = {
        "flight_domestic": {"vat": 5.0, "convenience": 25.0},
        "flight_international": {"vat": 0.0, "convenience": 50.0},
        "hotel_domestic": {"vat": 12.0, "convenience": 35.0},
        "hotel_international": {"vat": 0.0, "convenience": 65.0}
    }
    
    rate = rates.get(booking_type, {"vat": 0.0, "convenience": 0.0})
    vat_amount = base_amount * (rate["vat"] / 100)
    
    return {
        "base_amount": base_amount,
        "vat_percentage": rate["vat"],
        "vat_amount": vat_amount,
        "convenience_fee": rate["convenience"],
        "total_amount": base_amount + vat_amount + rate["convenience"]
    }
