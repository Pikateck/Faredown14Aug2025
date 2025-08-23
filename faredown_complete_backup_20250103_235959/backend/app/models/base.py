"""
Base models and common database utilities for Faredown
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime, Boolean, String, Text
from sqlalchemy.sql import func
from datetime import datetime
import uuid

# Create declarative base
Base = declarative_base()

class TimestampMixin:
    """Mixin for created_at and updated_at timestamps"""
    
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

class SoftDeleteMixin:
    """Mixin for soft delete functionality"""
    
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    def soft_delete(self):
        """Mark record as deleted"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()

class StatusMixin:
    """Mixin for status tracking"""
    
    is_active = Column(Boolean, default=True, nullable=False)
    status = Column(String(50), default="active", nullable=False)

def generate_unique_id():
    """Generate unique ID for records"""
    return str(uuid.uuid4())

class BaseModel(Base, TimestampMixin, SoftDeleteMixin):
    """Base model class with common fields"""
    
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def __repr__(self):
        """String representation of model"""
        return f"<{self.__class__.__name__}(id={self.id})>"
