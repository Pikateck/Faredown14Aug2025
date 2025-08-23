"""Promo Codes API Router for Faredown"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db

router = APIRouter()

class PromoCodeRequest(BaseModel):
    code: str
    booking_type: str
    amount: float

@router.post("/validate")
async def validate_promo_code(promo_data: PromoCodeRequest, db: Session = Depends(get_db)):
    """Validate promo code"""
    # Mock implementation
    if promo_data.code.upper() == "SAVE10":
        return {
            "valid": True,
            "discount_percentage": 10,
            "discount_amount": promo_data.amount * 0.1,
            "message": "10% discount applied"
        }
    return {
        "valid": False,
        "message": "Invalid promo code"
    }

@router.get("/available")
async def get_available_promos():
    """Get available promo codes"""
    return {
        "promos": [
            {
                "code": "SAVE10",
                "description": "10% off on all bookings",
                "discount_percentage": 10,
                "valid_until": "2024-12-31"
            }
        ]
    }
