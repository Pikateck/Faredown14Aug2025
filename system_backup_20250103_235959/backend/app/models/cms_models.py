"""
CMS Models for Faredown
Content management system models
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from .base import BaseModel

class CMSContent(BaseModel):
    """CMS content pages"""
    
    __tablename__ = "cms_content"
    
    page_key = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    meta_title = Column(String(200), nullable=True)
    meta_description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True, nullable=False)

class Banner(BaseModel):
    """Website banners"""
    
    __tablename__ = "banners"
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)
    link_url = Column(String(500), nullable=True)
    position = Column(String(50), default="hero", nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    valid_from = Column(DateTime, nullable=True)
    valid_until = Column(DateTime, nullable=True)

class Destination(BaseModel):
    """Destination content"""
    
    __tablename__ = "destinations"
    
    name = Column(String(200), nullable=False)
    country = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    gallery_images = Column(JSON, nullable=True)
    attractions = Column(JSON, nullable=True)
    best_time_to_visit = Column(Text, nullable=True)
    average_budget = Column(Integer, nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
