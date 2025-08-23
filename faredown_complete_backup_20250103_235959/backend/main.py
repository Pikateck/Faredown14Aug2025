"""
Faredown Backend API - Main Application Entry Point
AI-Powered Travel Booking Platform with Bargain Engine
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os
from datetime import datetime

# Import routers
from app.routers import (
    admin, users, bookings, airlines, hotels, 
    bargain, promo, currency, vat, cms, 
    extranet, ai, reports, auth
)
from app.database import engine, get_db
from app.models import Base
from app.core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    print("🚀 Faredown Backend API Starting...")
    print(f"📅 Started at: {datetime.now()}")
    print(f"🌐 Environment: {settings.ENVIRONMENT}")
    yield
    print("👋 Faredown Backend API Shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="Faredown Backend API",
    description="AI-Powered Travel Booking Platform with Real-time Bargain Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "🎯 Faredown Backend API - Live and Running!",
        "version": "1.0.0",
        "status": "active",
        "features": [
            "✅ AI-Powered Bargain Engine",
            "✅ Real-time Booking Management", 
            "✅ Extranet Deal System",
            "✅ Advanced Analytics & Reporting",
            "✅ Multi-currency Support",
            "✅ CMS Integration"
        ],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.now().isoformat()
    }

# Include all API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin Dashboard"])
app.include_router(users.router, prefix="/api/users", tags=["User Management"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Booking Management"])
app.include_router(airlines.router, prefix="/api/airlines", tags=["Airlines & Flights"])
app.include_router(hotels.router, prefix="/api/hotels", tags=["Hotels & Accommodation"])
app.include_router(bargain.router, prefix="/api/bargain", tags=["Bargain Engine"])
app.include_router(promo.router, prefix="/api/promo", tags=["Promo Codes"])
app.include_router(currency.router, prefix="/api/currency", tags=["Currency Management"])
app.include_router(vat.router, prefix="/api/vat", tags=["VAT & Fees"])
app.include_router(cms.router, prefix="/api/cms", tags=["Content Management"])
app.include_router(extranet.router, prefix="/api/extranet", tags=["Extranet System"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Engine"])
app.include_router(reports.router, prefix="/api/reports", tags=["Analytics & Reports"])

# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=settings.DEBUG
    )
