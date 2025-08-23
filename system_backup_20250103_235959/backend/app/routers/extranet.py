"""Extranet System API Router for Faredown"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from app.database import get_db

router = APIRouter()

class ExtranetDealRequest(BaseModel):
    deal_type: str  # 'hotel' or 'flight'
    title: str
    description: str
    pricing: Dict[str, Any]
    validity: Dict[str, str]
    terms: str

@router.post("/deals/create")
async def create_extranet_deal(deal_data: ExtranetDealRequest, db: Session = Depends(get_db)):
    """Create new extranet deal"""
    # Mock implementation
    deal_id = f"DEAL_{hash(deal_data.title) % 10000}"
    
    return {
        "deal_id": deal_id,
        "status": "pending_approval",
        "message": "Deal created successfully and sent for approval"
    }

@router.get("/deals")
async def get_extranet_deals():
    """Get all extranet deals"""
    return {
        "deals": [
            {
                "deal_id": "DEAL_1001",
                "deal_type": "hotel",
                "title": "Special Dubai Package",
                "description": "3 nights in luxury hotel",
                "price": 15000,
                "currency": "INR",
                "status": "active",
                "created_at": "2024-07-15T10:00:00Z"
            }
        ]
    }

@router.get("/deals/{deal_id}")
async def get_deal_details(deal_id: str):
    """Get specific deal details"""
    return {
        "deal_id": deal_id,
        "deal_type": "hotel",
        "title": "Special Dubai Package",
        "description": "3 nights in luxury hotel with breakfast",
        "pricing": {
            "base_price": 15000,
            "currency": "INR",
            "includes": ["Hotel", "Breakfast", "Airport Transfer"]
        },
        "validity": {
            "valid_from": "2024-07-20",
            "valid_until": "2024-12-31"
        },
        "terms": "Subject to availability. Non-refundable.",
        "status": "active"
    }

@router.put("/deals/{deal_id}/status")
async def update_deal_status(deal_id: str, status: str):
    """Update deal status"""
    valid_statuses = ["active", "inactive", "pending_approval", "rejected"]
    
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    return {
        "deal_id": deal_id,
        "status": status,
        "message": f"Deal status updated to {status}"
    }
