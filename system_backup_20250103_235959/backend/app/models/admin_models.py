"""
Admin Models for Faredown
Admin users, sessions, and audit logging
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from .base import BaseModel

class AdminUser(BaseModel):
    """Admin user accounts"""
    
    __tablename__ = "admin_users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(200), nullable=False)
    role = Column(String(50), default="admin", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    permissions = Column(JSON, nullable=True)

class AdminSession(BaseModel):
    """Admin session tracking"""
    
    __tablename__ = "admin_sessions"
    
    admin_id = Column(Integer, nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    ip_address = Column(String(45), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

class AuditLog(BaseModel):
    """System audit logging"""
    
    __tablename__ = "audit_logs"
    
    user_id = Column(Integer, nullable=True)
    admin_id = Column(Integer, nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
