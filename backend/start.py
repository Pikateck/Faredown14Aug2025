#!/usr/bin/env python3
"""
Faredown Backend Startup Script
Quick setup and start for the FastAPI backend server
"""

import os
import sys
import subprocess
import sqlite3
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_dependencies():
    """Install required Python packages"""
    print("📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def setup_database():
    """Create SQLite database if it doesn't exist"""
    db_path = Path("faredown.db")
    if not db_path.exists():
        print("🗄️  Creating SQLite database...")
        try:
            # Create empty database file
            conn = sqlite3.connect("faredown.db")
            conn.close()
            print("✅ Database created successfully")
        except Exception as e:
            print(f"❌ Failed to create database: {e}")
            sys.exit(1)
    else:
        print("✅ Database already exists")

def check_env_file():
    """Check if .env file exists"""
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ .env file not found")
        print("Please create .env file from .env.example")
        sys.exit(1)
    print("✅ Environment file found")

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting Faredown Backend Server...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔄 Health Check: http://localhost:8000/health")
    print("\n" + "="*50)
    
    try:
        # Start uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

def main():
    """Main startup sequence"""
    print("🎯 Faredown Backend Setup & Start")
    print("="*40)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Run setup checks
    check_python_version()
    check_env_file()
    install_dependencies()
    setup_database()
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()
