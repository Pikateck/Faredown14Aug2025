"""Airlines and Flights API Router for Faredown"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: datetime
    return_date: Optional[datetime] = None
    passengers: int = 1
    cabin_class: str = "economy"

@router.post("/search")
async def search_flights(search_data: FlightSearchRequest):
    """Search flights (mock implementation)"""
    return {
        "flights": [
            {
                "flight_number": "AI101",
                "airline": "Air India",
                "origin": search_data.origin,
                "destination": search_data.destination,
                "departure_time": "10:30",
                "arrival_time": "13:45",
                "duration": "3h 15m",
                "price": 8500,
                "currency": "INR"
            }
        ]
    }

@router.get("/airlines")
async def get_airlines():
    """Get list of airlines"""
    return {
        "airlines": [
            {"code": "AI", "name": "Air India"},
            {"code": "6E", "name": "IndiGo"},
            {"code": "SG", "name": "SpiceJet"}
        ]
    }
