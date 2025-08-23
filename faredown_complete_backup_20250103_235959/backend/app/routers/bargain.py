"""
Bargain Engine API Router for Faredown
AI-powered bargaining system with 10-minute sessions
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import uuid
import asyncio

from app.database import get_db
from app.models.user_models import User
from app.models.bargain_models import BargainSession, BargainAttempt, CounterOffer, BargainStatus, BargainAttemptType
from app.routers.auth import get_current_user
from app.services.ai_service import AIBargainService
from app.services.pricing_service import PricingService

router = APIRouter()

# Pydantic models
class StartBargainRequest(BaseModel):
    booking_type: str  # 'flight' or 'hotel'
    item_id: str
    item_data: Dict[str, Any]
    net_rate: float
    markup_min: float
    markup_max: float
    promo_discount: float = 0.0

class BargainOfferRequest(BaseModel):
    session_id: str
    offered_price: float
    user_message: Optional[str] = None

class BargainSessionResponse(BaseModel):
    session_id: str
    status: str
    time_remaining: int
    total_attempts: int
    max_attempts: int
    user_best_offer: Optional[float]
    ai_best_counter: Optional[float]
    agreed_price: Optional[float]
    final_price_range_min: float
    final_price_range_max: float
    can_bargain: bool

class BargainAttemptResponse(BaseModel):
    attempt_number: int
    attempt_type: str
    offered_price: float
    is_accepted: bool
    ai_reasoning: Optional[str]
    timestamp: datetime

class CounterOfferResponse(BaseModel):
    counter_price: float
    original_offer: float
    discount_amount: float
    discount_percentage: float
    strategy_type: str
    ai_message: Optional[str]
    incentives: Optional[Dict[str, Any]]
    valid_until: datetime
    is_final_offer: bool
    confidence_level: float
    savings: Dict[str, float]

# Initialize AI and Pricing services
ai_service = AIBargainService()
pricing_service = PricingService()

@router.post("/start", response_model=BargainSessionResponse)
async def start_bargain_session(
    request: StartBargainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new 10-minute bargain session"""
    
    # Validate pricing parameters
    if request.markup_min >= request.markup_max:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum markup must be less than maximum markup"
        )
    
    # Calculate price range
    base_price = request.net_rate * (1 + request.markup_max / 100)
    final_min = request.net_rate * (1 + request.markup_min / 100) - request.promo_discount
    final_max = base_price - request.promo_discount
    
    # Create new bargain session
    session_id = str(uuid.uuid4())
    bargain_session = BargainSession(
        session_id=session_id,
        user_id=current_user.id,
        booking_type=request.booking_type,
        item_id=request.item_id,
        item_data=request.item_data,
        net_rate=request.net_rate,
        markup_min=request.markup_min,
        markup_max=request.markup_max,
        base_price=base_price,
        promo_discount=request.promo_discount,
        final_price_range_min=final_min,
        final_price_range_max=final_max,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    
    # AI analysis for initial session setup
    ai_analysis = await ai_service.analyze_user_behavior(current_user.id, request.item_data)
    bargain_session.ai_confidence_score = ai_analysis.get("confidence", 0.7)
    bargain_session.price_sensitivity = ai_analysis.get("price_sensitivity", 0.5)
    bargain_session.conversion_probability = ai_analysis.get("conversion_probability", 0.6)
    
    db.add(bargain_session)
    db.commit()
    db.refresh(bargain_session)
    
    return BargainSessionResponse(
        session_id=bargain_session.session_id,
        status=bargain_session.status.value,
        time_remaining=bargain_session.time_remaining,
        total_attempts=bargain_session.total_attempts,
        max_attempts=bargain_session.max_attempts,
        user_best_offer=bargain_session.user_best_offer,
        ai_best_counter=bargain_session.ai_best_counter,
        agreed_price=bargain_session.agreed_price,
        final_price_range_min=bargain_session.final_price_range_min,
        final_price_range_max=bargain_session.final_price_range_max,
        can_bargain=bargain_session.can_bargain
    )

@router.post("/offer", response_model=Dict[str, Any])
async def make_bargain_offer(
    request: BargainOfferRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Make a bargain offer and get AI response"""
    
    # Find active session
    session = db.query(BargainSession).filter(
        BargainSession.session_id == request.session_id,
        BargainSession.user_id == current_user.id,
        BargainSession.status == BargainStatus.ACTIVE
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bargain session not found or expired"
        )
    
    # Check if session is still valid
    if not session.can_bargain:
        if session.is_expired:
            session.status = BargainStatus.EXPIRED
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bargain session has expired"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum bargain attempts reached"
            )
    
    # Validate offer price
    if request.offered_price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offer price must be greater than 0"
        )
    
    # Check for duplicate offers
    previous_attempt = db.query(BargainAttempt).filter(
        BargainAttempt.session_id == session.id,
        BargainAttempt.offered_price == request.offered_price
    ).first()
    
    if previous_attempt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already made this offer. Please try a different price."
        )
    
    # Create bargain attempt
    attempt_number = session.total_attempts + 1
    attempt = BargainAttempt(
        session_id=session.id,
        attempt_number=attempt_number,
        attempt_type=BargainAttemptType.USER_OFFER,
        offered_price=request.offered_price,
        user_message=request.user_message
    )
    
    # Check if offer is acceptable
    is_acceptable = session.is_price_acceptable(request.offered_price)
    attempt.is_accepted = is_acceptable
    
    # Update session
    session.total_attempts = attempt_number
    session.user_best_offer = request.offered_price
    
    if is_acceptable:
        # Accept the offer
        session.status = BargainStatus.ACCEPTED
        session.agreed_price = request.offered_price
        session.completed_at = datetime.utcnow()
        
        db.add(attempt)
        db.commit()
        
        return {
            "status": "accepted",
            "message": "🎉 Congratulations! Your offer has been accepted!",
            "agreed_price": request.offered_price,
            "savings": session.base_price - request.offered_price,
            "session": BargainSessionResponse(
                session_id=session.session_id,
                status=session.status.value,
                time_remaining=session.time_remaining,
                total_attempts=session.total_attempts,
                max_attempts=session.max_attempts,
                user_best_offer=session.user_best_offer,
                ai_best_counter=session.ai_best_counter,
                agreed_price=session.agreed_price,
                final_price_range_min=session.final_price_range_min,
                final_price_range_max=session.final_price_range_max,
                can_bargain=session.can_bargain
            )
        }
    
    # Generate AI counter offer
    ai_response = await ai_service.generate_counter_offer(
        session=session,
        user_offer=request.offered_price,
        attempt_number=attempt_number
    )
    
    # Update attempt with AI reasoning
    attempt.ai_reasoning = ai_response.get("reasoning")
    attempt.margin_analysis = ai_response.get("margin_analysis")
    attempt.user_behavior_score = ai_response.get("behavior_score")
    
    # Create counter offer
    counter_offer = CounterOffer(
        session_id=session.id,
        attempt_id=attempt.id,
        counter_price=ai_response["counter_price"],
        original_offer=request.offered_price,
        discount_amount=request.offered_price - ai_response["counter_price"],
        discount_percentage=((request.offered_price - ai_response["counter_price"]) / request.offered_price) * 100,
        strategy_type=ai_response["strategy"],
        ai_message=ai_response["message"],
        incentives=ai_response.get("incentives"),
        valid_until=datetime.utcnow() + timedelta(minutes=5),
        is_final_offer=(attempt_number >= session.max_attempts - 1),
        confidence_level=ai_response["confidence"],
        profit_margin=ai_response["profit_margin"]
    )
    
    session.ai_best_counter = ai_response["counter_price"]
    
    db.add(attempt)
    db.add(counter_offer)
    db.commit()
    
    # Schedule session cleanup
    background_tasks.add_task(cleanup_expired_sessions, db)
    
    return {
        "status": "counter_offer",
        "message": "We have a counter offer for you!",
        "attempt": BargainAttemptResponse(
            attempt_number=attempt.attempt_number,
            attempt_type=attempt.attempt_type.value,
            offered_price=attempt.offered_price,
            is_accepted=attempt.is_accepted,
            ai_reasoning=attempt.ai_reasoning,
            timestamp=attempt.created_at
        ),
        "counter_offer": CounterOfferResponse(
            counter_price=counter_offer.counter_price,
            original_offer=counter_offer.original_offer,
            discount_amount=counter_offer.discount_amount,
            discount_percentage=counter_offer.discount_percentage,
            strategy_type=counter_offer.strategy_type,
            ai_message=counter_offer.ai_message,
            incentives=counter_offer.incentives,
            valid_until=counter_offer.valid_until,
            is_final_offer=counter_offer.is_final_offer,
            confidence_level=counter_offer.confidence_level,
            savings=counter_offer.calculate_savings()
        ),
        "session": BargainSessionResponse(
            session_id=session.session_id,
            status=session.status.value,
            time_remaining=session.time_remaining,
            total_attempts=session.total_attempts,
            max_attempts=session.max_attempts,
            user_best_offer=session.user_best_offer,
            ai_best_counter=session.ai_best_counter,
            agreed_price=session.agreed_price,
            final_price_range_min=session.final_price_range_min,
            final_price_range_max=session.final_price_range_max,
            can_bargain=session.can_bargain
        )
    }

@router.post("/accept-counter/{session_id}")
async def accept_counter_offer(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept AI counter offer"""
    
    session = db.query(BargainSession).filter(
        BargainSession.session_id == session_id,
        BargainSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bargain session not found"
        )
    
    # Get latest counter offer
    counter_offer = db.query(CounterOffer).filter(
        CounterOffer.session_id == session.id
    ).order_by(CounterOffer.created_at.desc()).first()
    
    if not counter_offer or counter_offer.is_expired:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid counter offer available"
        )
    
    # Accept the counter offer
    session.status = BargainStatus.ACCEPTED
    session.agreed_price = counter_offer.counter_price
    session.completed_at = datetime.utcnow()
    counter_offer.was_accepted = True
    
    db.commit()
    
    return {
        "status": "accepted",
        "message": "🎉 Great choice! Counter offer accepted!",
        "agreed_price": counter_offer.counter_price,
        "savings": counter_offer.calculate_savings()
    }

@router.get("/session/{session_id}", response_model=BargainSessionResponse)
async def get_bargain_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get bargain session details"""
    
    session = db.query(BargainSession).filter(
        BargainSession.session_id == session_id,
        BargainSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bargain session not found"
        )
    
    return BargainSessionResponse(
        session_id=session.session_id,
        status=session.status.value,
        time_remaining=session.time_remaining,
        total_attempts=session.total_attempts,
        max_attempts=session.max_attempts,
        user_best_offer=session.user_best_offer,
        ai_best_counter=session.ai_best_counter,
        agreed_price=session.agreed_price,
        final_price_range_min=session.final_price_range_min,
        final_price_range_max=session.final_price_range_max,
        can_bargain=session.can_bargain
    )

@router.get("/history")
async def get_bargain_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's bargain history"""
    
    sessions = db.query(BargainSession).filter(
        BargainSession.user_id == current_user.id
    ).order_by(BargainSession.created_at.desc()).limit(20).all()
    
    return [
        {
            "session_id": session.session_id,
            "booking_type": session.booking_type,
            "status": session.status.value,
            "base_price": session.base_price,
            "agreed_price": session.agreed_price,
            "savings": session.base_price - (session.agreed_price or session.base_price),
            "created_at": session.created_at,
            "completed_at": session.completed_at
        }
        for session in sessions
    ]

async def cleanup_expired_sessions(db: Session):
    """Background task to cleanup expired sessions"""
    expired_sessions = db.query(BargainSession).filter(
        BargainSession.status == BargainStatus.ACTIVE,
        BargainSession.expires_at < datetime.utcnow()
    ).all()
    
    for session in expired_sessions:
        session.status = BargainStatus.EXPIRED
    
    db.commit()
