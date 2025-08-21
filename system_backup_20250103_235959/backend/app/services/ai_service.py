"""
AI Service for Faredown Bargain Engine
OpenAI-powered intelligent bargaining and pricing decisions
"""

import openai
import json
import random
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from app.core.config import settings
from app.models.bargain_models import BargainSession
from app.models.user_models import User

# Configure OpenAI
openai.api_key = settings.OPENAI_API_KEY

logger = logging.getLogger(__name__)

class AIBargainService:
    """AI-powered bargain decision service"""
    
    def __init__(self):
        self.model = settings.AI_MODEL
        self.strategies = ["aggressive", "moderate", "conservative"]
    
    async def analyze_user_behavior(self, user_id: int, item_data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze user behavior and return scoring metrics"""
        
        # In production, this would analyze:
        # - User's booking history
        # - Previous bargain attempts
        # - Time of day/week patterns
        # - Price sensitivity indicators
        # - Market comparison data
        
        # For now, return intelligent defaults with some variation
        base_confidence = 0.7
        base_sensitivity = 0.5
        base_conversion = 0.6
        
        # Add some intelligent variation based on item data
        if item_data.get("booking_type") == "flight":
            # Flights typically have less bargain flexibility
            base_confidence -= 0.1
            base_conversion -= 0.1
        
        if item_data.get("is_premium", False):
            # Premium items have different sensitivity
            base_sensitivity -= 0.2
            base_conversion += 0.1
        
        return {
            "confidence": max(0.1, min(1.0, base_confidence + random.uniform(-0.2, 0.2))),
            "price_sensitivity": max(0.1, min(1.0, base_sensitivity + random.uniform(-0.3, 0.3))),
            "conversion_probability": max(0.1, min(1.0, base_conversion + random.uniform(-0.2, 0.2)))
        }
    
    async def generate_counter_offer(
        self, 
        session: BargainSession, 
        user_offer: float, 
        attempt_number: int
    ) -> Dict[str, Any]:
        """Generate AI counter offer based on bargain context"""
        
        # Calculate profit margins and constraints
        min_acceptable = session.final_price_range_min
        max_price = session.final_price_range_max
        profit_margin = (user_offer - session.net_rate) / session.net_rate
        
        # Determine strategy based on attempt number and profit margin
        strategy = self._determine_strategy(attempt_number, profit_margin, session.max_attempts)
        
        # Calculate counter offer price
        counter_price = await self._calculate_counter_price(
            user_offer=user_offer,
            min_acceptable=min_acceptable,
            max_price=max_price,
            strategy=strategy,
            attempt_number=attempt_number,
            max_attempts=session.max_attempts
        )
        
        # Generate AI message
        ai_message = await self._generate_ai_message(
            user_offer=user_offer,
            counter_price=counter_price,
            strategy=strategy,
            attempt_number=attempt_number,
            session=session
        )
        
        # Calculate incentives
        incentives = self._generate_incentives(strategy, attempt_number, session)
        
        # AI reasoning for admin analytics
        reasoning = self._generate_reasoning(
            user_offer, counter_price, strategy, profit_margin
        )
        
        return {
            "counter_price": round(counter_price, 2),
            "strategy": strategy,
            "message": ai_message,
            "incentives": incentives,
            "confidence": session.ai_confidence_score or 0.7,
            "profit_margin": round(profit_margin * 100, 2),
            "reasoning": reasoning,
            "margin_analysis": {
                "user_offer_margin": round(profit_margin * 100, 2),
                "counter_offer_margin": round(((counter_price - session.net_rate) / session.net_rate) * 100, 2),
                "min_acceptable_margin": round(((min_acceptable - session.net_rate) / session.net_rate) * 100, 2)
            },
            "behavior_score": 0.8  # Based on user behavior analysis
        }
    
    def _determine_strategy(self, attempt_number: int, profit_margin: float, max_attempts: int) -> str:
        """Determine bargaining strategy based on context"""
        
        # First attempt - be moderate
        if attempt_number == 1:
            if profit_margin < 0.05:  # Less than 5% margin
                return "conservative"
            elif profit_margin > 0.15:  # More than 15% margin
                return "aggressive"
            else:
                return "moderate"
        
        # Final attempt - be more aggressive
        elif attempt_number >= max_attempts - 1:
            return "aggressive"
        
        # Middle attempts - adapt based on margin
        else:
            if profit_margin < 0.08:
                return "conservative"
            else:
                return "moderate"
    
    async def _calculate_counter_price(
        self,
        user_offer: float,
        min_acceptable: float,
        max_price: float,
        strategy: str,
        attempt_number: int,
        max_attempts: int
    ) -> float:
        """Calculate AI counter offer price"""
        
        # Strategy-based counter offer calculation
        if strategy == "aggressive":
            # Move closer to user's offer
            adjustment_factor = 0.6  # Move 60% towards user offer
        elif strategy == "moderate":
            # Moderate movement
            adjustment_factor = 0.4  # Move 40% towards user offer
        else:  # conservative
            # Small movement
            adjustment_factor = 0.2  # Move 20% towards user offer
        
        # Calculate base counter price
        price_difference = max_price - user_offer
        counter_price = max_price - (price_difference * adjustment_factor)
        
        # Ensure counter price is above minimum acceptable
        counter_price = max(counter_price, min_acceptable)
        
        # Final attempt should be more aggressive
        if attempt_number >= max_attempts - 1:
            counter_price = min_acceptable + ((counter_price - min_acceptable) * 0.3)
        
        return counter_price
    
    async def _generate_ai_message(
        self,
        user_offer: float,
        counter_price: float,
        strategy: str,
        attempt_number: int,
        session: BargainSession
    ) -> str:
        """Generate personalized AI message for counter offer"""
        
        savings = user_offer - counter_price
        savings_percentage = (savings / user_offer) * 100
        
        # Strategy-based message templates
        if strategy == "aggressive":
            messages = [
                f"Great offer! I can get you an even better deal at ₹{counter_price:,.0f} - that's ₹{savings:,.0f} in savings!",
                f"You drive a hard bargain! How about ₹{counter_price:,.0f}? You'll save ₹{savings:,.0f} from your offer!",
                f"I like your style! Let's meet at ₹{counter_price:,.0f} - you're saving {savings_percentage:.1f}% from your original offer!"
            ]
        elif strategy == "moderate":
            messages = [
                f"I can work with that! How about ₹{counter_price:,.0f}? This gives you great value while ensuring quality service.",
                f"Let's find a middle ground at ₹{counter_price:,.0f} - you'll still save ₹{savings:,.0f}!",
                f"I can offer you ₹{counter_price:,.0f} - this is a fantastic deal that works for both of us!"
            ]
        else:  # conservative
            messages = [
                f"I appreciate your offer! The best I can do is ₹{counter_price:,.0f} while maintaining our premium service quality.",
                f"This is a popular choice! I can offer ₹{counter_price:,.0f} - this ensures you get the best experience.",
                f"For this premium option, ₹{counter_price:,.0f} is the best available price I can secure for you."
            ]
        
        # Add attempt-specific context
        if attempt_number == 1:
            return random.choice(messages)
        elif attempt_number >= session.max_attempts - 1:
            final_messages = [
                f"This is my final offer: ₹{counter_price:,.0f}. You're getting an incredible deal - save ₹{savings:,.0f}!",
                f"Last chance for this amazing price: ₹{counter_price:,.0f}! Don't miss out on saving ₹{savings:,.0f}!",
                f"Final offer: ₹{counter_price:,.0f}. This is the absolute best price I can secure for you!"
            ]
            return random.choice(final_messages)
        else:
            return random.choice(messages) + f" (Attempt {attempt_number} of {session.max_attempts})"
    
    def _generate_incentives(self, strategy: str, attempt_number: int, session: BargainSession) -> Optional[Dict[str, Any]]:
        """Generate additional incentives based on strategy"""
        
        incentives = {}
        
        # Strategy-based incentives
        if strategy == "aggressive" or attempt_number >= session.max_attempts - 1:
            incentives = {
                "free_cancellation": "Free cancellation up to 24 hours before travel",
                "priority_support": "24/7 priority customer support",
                "extra_baggage": "Complimentary extra baggage allowance" if session.booking_type == "flight" else None,
                "late_checkout": "Free late checkout" if session.booking_type == "hotel" else None
            }
        elif strategy == "moderate":
            incentives = {
                "free_cancellation": "Free cancellation up to 48 hours before travel",
                "customer_support": "Dedicated customer support"
            }
        
        # Remove None values
        return {k: v for k, v in incentives.items() if v is not None} if incentives else None
    
    def _generate_reasoning(self, user_offer: float, counter_price: float, strategy: str, profit_margin: float) -> str:
        """Generate reasoning for admin analytics"""
        
        reasoning_parts = [
            f"User offered ₹{user_offer:,.0f} with {profit_margin*100:.1f}% profit margin",
            f"Applied {strategy} strategy",
            f"Counter offer: ₹{counter_price:,.0f}",
            f"Expected profit margin: {((counter_price - (user_offer * 0.85)) / (user_offer * 0.85)) * 100:.1f}%"
        ]
        
        return " | ".join(reasoning_parts)

    async def generate_dynamic_pricing(self, item_data: Dict[str, Any]) -> Dict[str, float]:
        """Generate dynamic pricing suggestions"""
        
        # This would integrate with real market data APIs
        # For now, return intelligent suggestions
        
        base_price = item_data.get("base_price", 1000)
        
        # Market factors simulation
        demand_factor = random.uniform(0.8, 1.2)  # Market demand
        seasonal_factor = random.uniform(0.9, 1.1)  # Seasonal pricing
        competitor_factor = random.uniform(0.95, 1.05)  # Competitor analysis
        
        suggested_price = base_price * demand_factor * seasonal_factor * competitor_factor
        
        return {
            "suggested_price": round(suggested_price, 2),
            "demand_factor": round(demand_factor, 2),
            "seasonal_factor": round(seasonal_factor, 2),
            "competitor_factor": round(competitor_factor, 2),
            "confidence_score": 0.85
        }
