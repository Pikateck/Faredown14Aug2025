"""
Booking Management API Router for Faredown
Complete booking workflow with payments
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import secrets

from app.database import get_db
from app.models.user_models import User
from app.models.booking_models import Booking, BookingItem, Payment, BookingStatus, PaymentStatus, PaymentMethod
from app.routers.auth import get_current_user

router = APIRouter()

# Pydantic models
class CreateBookingRequest(BaseModel):
    booking_type: str  # 'flight', 'hotel', 'package'
    items: List[Dict[str, Any]]
    passenger_details: Dict[str, Any]
    base_amount: float
    tax_amount: float
    convenience_fee: float
    promo_discount: float
    total_amount: float
    currency: str = "INR"
    bargain_session_id: Optional[str] = None
    special_requests: Optional[str] = None

class BookingResponse(BaseModel):
    booking_reference: str
    status: str
    total_amount: float
    currency: str
    created_at: datetime

class PaymentRequest(BaseModel):
    booking_reference: str
    payment_method: str
    amount: float
    gateway_data: Dict[str, Any]

@router.post("/create", response_model=BookingResponse)
async def create_booking(
    booking_data: CreateBookingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new booking"""
    
    # Generate unique booking reference
    booking_reference = f"FD{secrets.token_hex(4).upper()}{current_user.id}"
    
    # Extract passenger details
    lead_passenger = booking_data.passenger_details.get("lead_passenger", {})
    
    # Create booking
    booking = Booking(
        booking_reference=booking_reference,
        user_id=current_user.id,
        booking_type=booking_data.booking_type,
        base_amount=booking_data.base_amount,
        tax_amount=booking_data.tax_amount,
        convenience_fee=booking_data.convenience_fee,
        promo_discount=booking_data.promo_discount,
        total_amount=booking_data.total_amount,
        currency=booking_data.currency,
        passenger_count=len(booking_data.passenger_details.get("passengers", [1])),
        lead_passenger_name=lead_passenger.get("name", current_user.full_name),
        lead_passenger_email=lead_passenger.get("email", current_user.email),
        lead_passenger_phone=lead_passenger.get("phone", current_user.phone or ""),
        special_requests=booking_data.special_requests,
        bargain_session_id=booking_data.bargain_session_id,
        was_bargained=bool(booking_data.bargain_session_id)
    )
    
    # If from bargain session, calculate savings
    if booking_data.bargain_session_id:
        # In production, fetch actual bargain session and calculate savings
        booking.bargain_savings = 500.0  # Mock value
        booking.original_price = booking_data.total_amount + booking.bargain_savings
    
    db.add(booking)
    db.flush()  # Get booking ID
    
    # Create booking items
    for item_data in booking_data.items:
        booking_item = BookingItem(
            booking_id=booking.id,
            item_type=item_data.get("type", "unknown"),
            item_name=item_data.get("name", ""),
            item_description=item_data.get("description"),
            unit_price=item_data.get("unit_price", 0),
            quantity=item_data.get("quantity", 1),
            total_price=item_data.get("total_price", 0),
            item_data=item_data
        )
        db.add(booking_item)
    
    db.commit()
    db.refresh(booking)
    
    return BookingResponse(
        booking_reference=booking.booking_reference,
        status=booking.status.value,
        total_amount=booking.total_amount,
        currency=booking.currency,
        created_at=booking.created_at
    )

@router.get("/my-bookings")
async def get_user_bookings(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's booking history"""
    
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.created_at.desc()).limit(limit).all()
    
    return [
        {
            "booking_reference": booking.booking_reference,
            "booking_type": booking.booking_type,
            "status": booking.status.value,
            "total_amount": booking.total_amount,
            "currency": booking.currency,
            "was_bargained": booking.was_bargained,
            "bargain_savings": booking.bargain_savings,
            "departure_date": booking.departure_date,
            "return_date": booking.return_date,
            "passenger_count": booking.passenger_count,
            "lead_passenger_name": booking.lead_passenger_name,
            "created_at": booking.created_at,
            "confirmed_at": booking.confirmed_at
        }
        for booking in bookings
    ]

@router.get("/{booking_reference}")
async def get_booking_details(
    booking_reference: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed booking information"""
    
    booking = db.query(Booking).filter(
        Booking.booking_reference == booking_reference,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Get booking items
    items = db.query(BookingItem).filter(
        BookingItem.booking_id == booking.id
    ).all()
    
    # Get payments
    payments = db.query(Payment).filter(
        Payment.booking_id == booking.id
    ).all()
    
    return {
        "booking_reference": booking.booking_reference,
        "booking_type": booking.booking_type,
        "status": booking.status.value,
        "total_amount": booking.total_amount,
        "base_amount": booking.base_amount,
        "tax_amount": booking.tax_amount,
        "convenience_fee": booking.convenience_fee,
        "promo_discount": booking.promo_discount,
        "currency": booking.currency,
        "was_bargained": booking.was_bargained,
        "bargain_savings": booking.bargain_savings,
        "original_price": booking.original_price,
        "passenger_count": booking.passenger_count,
        "lead_passenger_name": booking.lead_passenger_name,
        "lead_passenger_email": booking.lead_passenger_email,
        "lead_passenger_phone": booking.lead_passenger_phone,
        "departure_date": booking.departure_date,
        "return_date": booking.return_date,
        "special_requests": booking.special_requests,
        "supplier_name": booking.supplier_name,
        "supplier_confirmation": booking.supplier_confirmation,
        "created_at": booking.created_at,
        "confirmed_at": booking.confirmed_at,
        "items": [
            {
                "item_type": item.item_type,
                "item_name": item.item_name,
                "item_description": item.item_description,
                "unit_price": item.unit_price,
                "quantity": item.quantity,
                "total_price": item.total_price,
                "status": item.status,
                "item_data": item.item_data
            }
            for item in items
        ],
        "payments": [
            {
                "payment_id": payment.payment_id,
                "amount": payment.amount,
                "currency": payment.currency,
                "payment_method": payment.payment_method.value,
                "status": payment.status.value,
                "gateway": payment.payment_gateway,
                "initiated_at": payment.initiated_at,
                "completed_at": payment.completed_at
            }
            for payment in payments
        ]
    }

@router.post("/payment/initiate")
async def initiate_payment(
    payment_data: PaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate payment for a booking"""
    
    # Find booking
    booking = db.query(Booking).filter(
        Booking.booking_reference == payment_data.booking_reference,
        Booking.user_id == current_user.id,
        Booking.status == BookingStatus.PENDING
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or already processed"
        )
    
    # Validate payment amount
    if payment_data.amount != booking.total_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount does not match booking total"
        )
    
    # Create payment record
    payment_id = f"PAY_{secrets.token_hex(6).upper()}"
    payment = Payment(
        booking_id=booking.id,
        payment_id=payment_id,
        amount=payment_data.amount,
        currency=booking.currency,
        payment_method=PaymentMethod(payment_data.payment_method),
        payment_gateway="razorpay",  # Default gateway
        gateway_response=payment_data.gateway_data
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # In production, integrate with actual payment gateway
    # For demo, simulate payment processing
    payment.status = PaymentStatus.PROCESSING
    payment.gateway_transaction_id = f"razorpay_{secrets.token_hex(8)}"
    
    db.commit()
    
    return {
        "payment_id": payment.payment_id,
        "status": payment.status.value,
        "gateway_transaction_id": payment.gateway_transaction_id,
        "amount": payment.amount,
        "currency": payment.currency
    }

@router.post("/payment/{payment_id}/confirm")
async def confirm_payment(
    payment_id: str,
    gateway_response: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm payment completion"""
    
    # Find payment
    payment = db.query(Payment).join(Booking).filter(
        Payment.payment_id == payment_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Update payment status
    payment.status = PaymentStatus.COMPLETED
    payment.completed_at = datetime.utcnow()
    payment.gateway_response = gateway_response
    
    # Update booking status
    booking = payment.booking
    booking.status = BookingStatus.CONFIRMED
    booking.confirmed_at = datetime.utcnow()
    booking.supplier_booking_ref = f"SUP_{secrets.token_hex(4).upper()}"
    
    db.commit()

    # Process loyalty points earning (non-blocking)
    try:
        import asyncio
        import httpx
        import os

        async def process_loyalty_earning():
            try:
                loyalty_server_url = os.getenv('LOYALTY_SERVER_URL', 'http://localhost:5000')

                # Calculate eligible amount (adjust based on your price structure)
                eligible_amount = float(booking.total_amount) * 0.8  # 80% of total (excluding taxes/fees)

                loyalty_data = {
                    "userId": str(current_user.id),
                    "bookingId": booking.booking_reference,
                    "bookingType": "HOTEL" if booking.booking_type.value == "hotel" else "FLIGHT",
                    "eligibility": {
                        "eligibleAmount": eligible_amount,
                        "currency": booking.currency or "INR",
                        "fxRate": 1.0
                    },
                    "description": f"{booking.booking_type.value.title()} booking confirmed"
                }

                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{loyalty_server_url}/api/loyalty/process-earning",
                        json=loyalty_data,
                        timeout=5.0
                    )

                    if response.status_code == 200:
                        result = response.json()
                        if result.get("success"):
                            print(f"✅ Loyalty points earned for booking {booking.booking_reference}")
                        else:
                            print(f"❌ Loyalty earning failed: {result.get('error')}")
                    else:
                        print(f"❌ Loyalty service error: {response.status_code}")

            except Exception as e:
                print(f"❌ Error processing loyalty earning: {e}")

        # Run loyalty earning in background (don't await)
        asyncio.create_task(process_loyalty_earning())

    except Exception as e:
        print(f"❌ Failed to trigger loyalty earning: {e}")
        # Continue with normal response even if loyalty fails

    return {
        "message": "Payment confirmed successfully",
        "booking_reference": booking.booking_reference,
        "payment_status": payment.status.value,
        "booking_status": booking.status.value
    }

@router.post("/{booking_reference}/cancel")
async def cancel_booking(
    booking_reference: str,
    cancellation_reason: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel a booking"""
    
    booking = db.query(Booking).filter(
        Booking.booking_reference == booking_reference,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.status in [BookingStatus.CANCELLED, BookingStatus.COMPLETED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot be cancelled"
        )
    
    # Check if booking is refundable
    if not booking.is_refundable:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is not eligible for cancellation"
        )
    
    # Calculate refund amount
    refund_amount = booking.calculate_refund_amount()
    cancellation_fee = booking.total_amount - refund_amount
    
    # Update booking
    booking.status = BookingStatus.CANCELLED
    booking.cancelled_at = datetime.utcnow()
    booking.cancellation_reason = cancellation_reason
    booking.refund_amount = refund_amount
    booking.cancellation_fee = cancellation_fee
    
    db.commit()
    
    return {
        "message": "Booking cancelled successfully",
        "refund_amount": refund_amount,
        "cancellation_fee": cancellation_fee,
        "status": booking.status.value
    }
