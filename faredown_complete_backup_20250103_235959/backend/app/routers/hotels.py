"""Hotels API Router for Faredown"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class HotelSearchRequest(BaseModel):
    destination: str
    check_in: datetime
    check_out: datetime
    guests: int = 2
    rooms: int = 1

@router.post("/search")
async def search_hotels(search_data: HotelSearchRequest):
    """Search hotels (mock implementation)"""
    return {
        "hotels": [
            {
                "id": "hotel_1",
                "name": "Grand Hyatt Dubai",
                "location": "Dubai, UAE",
                "rating": 4.5,
                "price_per_night": 12000,
                "currency": "INR",
                "image_url": "https://example.com/hotel1.jpg"
            }
        ]
    }

@router.get("/{hotel_id}")
async def get_hotel_details(hotel_id: str):
    """Get hotel details"""
    return {
        "id": hotel_id,
        "name": "Grand Hyatt Dubai",
        "location": "Dubai, UAE",
        "rating": 4.5,
        "description": "Luxury hotel in Dubai",
        "amenities": ["Pool", "Spa", "Gym", "Restaurant"]
    }
