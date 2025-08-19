"""
Booking Management Models for Faredown
Complete booking workflow with payments and status tracking
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
import enum
from datetime import datetime

class BookingStatus(enum.Enum):
    """Booking status options"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    REFUNDED = "refunded"
    FAILED = "failed"

class PaymentStatus(enum.Enum):
    """Payment status options"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIAL_REFUND = "partial_refund"

class PaymentMethod(enum.Enum):
    """Payment method options"""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    NET_BANKING = "net_banking"
    UPI = "upi"
    WALLET = "wallet"
    EMI = "emi"

class Booking(BaseModel):
    """Main booking record for all types (flights, hotels, packages)"""
    
    __tablename__ = "bookings"
    
    # Booking Identification
    booking_reference = Column(String(20), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Booking Details
    booking_type = Column(String(20), nullable=False)  # 'flight', 'hotel', 'package'
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    
    # Pricing Information
    base_amount = Column(Float, nullable=False)  # Base price before taxes
    tax_amount = Column(Float, default=0.0, nullable=False)  # Total taxes
    convenience_fee = Column(Float, default=0.0, nullable=False)  # Platform fee
    promo_discount = Column(Float, default=0.0, nullable=False)  # Promo discount
    total_amount = Column(Float, nullable=False)  # Final amount paid
    currency = Column(String(3), default="INR", nullable=False)
    
    # Bargain Information
    was_bargained = Column(Boolean, default=False, nullable=False)
    original_price = Column(Float, nullable=True)  # Price before bargaining
    bargain_savings = Column(Float, default=0.0, nullable=False)  # Amount saved
    bargain_session_id = Column(String(100), nullable=True)  # Reference to bargain session
    
    # Travel Details
    departure_date = Column(DateTime, nullable=True)
    return_date = Column(DateTime, nullable=True)
    passenger_count = Column(Integer, default=1, nullable=False)
    room_count = Column(Integer, default=0, nullable=False)  # For hotel bookings
    
    # Contact Information
    lead_passenger_name = Column(String(200), nullable=False)
    lead_passenger_email = Column(String(255), nullable=False)
    lead_passenger_phone = Column(String(20), nullable=False)
    
    # Supplier Information
    supplier_name = Column(String(200), nullable=True)
    supplier_booking_ref = Column(String(100), nullable=True)
    supplier_confirmation = Column(String(100), nullable=True)
    
    # Booking Metadata
    booking_source = Column(String(50), default="website", nullable=False)  # website, mobile, api
    user_ip = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Important Timestamps
    booked_at = Column(DateTime, server_default=func.now(), nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Cancellation Details
    cancellation_reason = Column(Text, nullable=True)
    refund_amount = Column(Float, nullable=True)
    cancellation_fee = Column(Float, default=0.0, nullable=False)
    
    # Special Requirements
    special_requests = Column(Text, nullable=True)
    meal_preferences = Column(JSON, nullable=True)  # For flights
    accessibility_needs = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="bookings")
    items = relationship("BookingItem", back_populates="booking")
    payments = relationship("Payment", back_populates="booking")
    flight_booking = relationship("FlightBooking", back_populates="booking", uselist=False)
    hotel_booking = relationship("HotelBooking", back_populates="booking", uselist=False)
    
    @property
    def is_refundable(self) -> bool:
        """Check if booking is eligible for refund"""
        if self.status in [BookingStatus.CANCELLED, BookingStatus.REFUNDED]:
            return False
        
        # Check if departure date is in future (simplified logic)
        if self.departure_date and self.departure_date > datetime.utcnow():
            return True
        
        return False
    
    def calculate_refund_amount(self) -> float:
        """Calculate refund amount based on cancellation policy"""
        if not self.is_refundable:
            return 0.0
        
        # Simplified refund calculation
        # In production, this would check airline/hotel cancellation policies
        refund_percentage = 0.8  # 80% refund
        return self.total_amount * refund_percentage

class BookingItem(BaseModel):
    """Individual items within a booking (flights, rooms, etc.)"""
    
    __tablename__ = "booking_items"
    
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    
    # Item Details
    item_type = Column(String(20), nullable=False)  # 'flight', 'hotel_room', 'addon'
    item_name = Column(String(300), nullable=False)
    item_description = Column(Text, nullable=True)
    
    # Pricing
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Item-specific data
    item_data = Column(JSON, nullable=True)  # Store specific details
    
    # Supplier details
    supplier_item_id = Column(String(100), nullable=True)
    supplier_confirmation = Column(String(100), nullable=True)
    
    # Status
    status = Column(String(20), default="confirmed", nullable=False)
    
    # Relationship
    booking = relationship("Booking", back_populates="items")

class Payment(BaseModel):
    """Payment records for bookings"""
    
    __tablename__ = "payments"
    
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    
    # Payment Identification
    payment_id = Column(String(100), unique=True, index=True, nullable=False)
    gateway_transaction_id = Column(String(200), nullable=True)
    
    # Payment Details
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    
    # Gateway Information
    payment_gateway = Column(String(50), nullable=False)  # razorpay, stripe, payu
    gateway_response = Column(JSON, nullable=True)  # Full gateway response
    
    # Card Details (masked)
    card_last_four = Column(String(4), nullable=True)
    card_brand = Column(String(20), nullable=True)  # visa, mastercard, etc.
    card_type = Column(String(20), nullable=True)  # credit, debit
    
    # Timing
    initiated_at = Column(DateTime, server_default=func.now(), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    
    # Failure Information
    failure_reason = Column(Text, nullable=True)
    gateway_error_code = Column(String(50), nullable=True)
    
    # Refund Information
    refund_amount = Column(Float, default=0.0, nullable=False)
    refunded_at = Column(DateTime, nullable=True)
    refund_reference = Column(String(100), nullable=True)
    
    # Risk Assessment
    risk_score = Column(Float, nullable=True)  # 0-1 risk score
    fraud_check_status = Column(String(20), default="pending", nullable=False)
    
    # Relationship
    booking = relationship("Booking", back_populates="payments")
    
    @property
    def is_successful(self) -> bool:
        """Check if payment was successful"""
        return self.status == PaymentStatus.COMPLETED
    
    @property
    def can_refund(self) -> bool:
        """Check if payment can be refunded"""
        return (
            self.status == PaymentStatus.COMPLETED and
            self.refund_amount < self.amount
        )
