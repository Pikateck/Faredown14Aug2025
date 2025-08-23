"""
AI Models for Faredown
AI recommendations, analytics, and logging
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class AIRecommendation(BaseModel):
    """AI-generated recommendations for users"""
    
    __tablename__ = "ai_recommendations"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Recommendation Details
    recommendation_type = Column(String(50), nullable=False)  # destination, deal, upsell
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # AI Scoring
    confidence_score = Column(Float, nullable=False)  # 0-1
    relevance_score = Column(Float, nullable=False)  # 0-1
    personalization_factors = Column(JSON, nullable=True)  # Factors used for recommendation
    
    # Content
    recommended_item_type = Column(String(50), nullable=False)  # flight, hotel, package
    recommended_item_id = Column(String(100), nullable=True)
    estimated_price = Column(Float, nullable=True)
    
    # Interaction Tracking
    is_viewed = Column(Boolean, default=False, nullable=False)
    is_clicked = Column(Boolean, default=False, nullable=False)
    is_booked = Column(Boolean, default=False, nullable=False)
    viewed_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    
    # Validity
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

class AIAnalytics(BaseModel):
    """AI system analytics and performance metrics"""
    
    __tablename__ = "ai_analytics"
    
    # Metric Information
    metric_type = Column(String(50), nullable=False)  # bargain_accuracy, recommendation_ctr
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    
    # Context
    context_data = Column(JSON, nullable=True)  # Additional context for the metric
    calculation_method = Column(String(100), nullable=True)
    
    # Time Period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Metadata
    ai_model_version = Column(String(50), nullable=True)
    data_source = Column(String(100), nullable=True)

class AILog(BaseModel):
    """AI decision and process logging"""
    
    __tablename__ = "ai_logs"
    
    # Event Information
    event_type = Column(String(50), nullable=False)  # bargain_decision, price_suggestion, recommendation_generation
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=True)
    
    # AI Decision Details
    input_data = Column(JSON, nullable=False)  # Input parameters
    output_data = Column(JSON, nullable=False)  # AI output/decision
    confidence_score = Column(Float, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    
    # Model Information
    ai_model_used = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=True)
    
    # Decision Factors
    decision_factors = Column(JSON, nullable=True)  # Factors that influenced the decision
    fallback_used = Column(Boolean, default=False, nullable=False)  # If fallback logic was used
    
    # Outcome Tracking
    actual_outcome = Column(String(100), nullable=True)  # What actually happened
    outcome_tracked_at = Column(DateTime, nullable=True)
    success_metric = Column(Float, nullable=True)  # Success score if applicable
    
    # Error Handling
    error_occurred = Column(Boolean, default=False, nullable=False)
    error_message = Column(Text, nullable=True)
    error_code = Column(String(50), nullable=True)
