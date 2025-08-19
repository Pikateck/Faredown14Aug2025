#!/usr/bin/env python3
"""
Faredown Backend Quick Start Script
Starts the backend server with minimal setup
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def main():
    """Start the Faredown backend server"""
    
    print("🎯 Faredown Backend Server")
    print("=" * 40)
    
    # Change to backend directory
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        print("Please run this script from the project root directory")
        sys.exit(1)
    
    os.chdir(backend_dir)
    
    # Check if .env exists
    if not Path(".env").exists():
        print("✅ Environment file found")
    
    print("🚀 Starting Faredown Backend Server...")
    print("📍 Server URL: http://localhost:8000")
    print("📖 API Docs: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("\n🔄 Starting server... (Press Ctrl+C to stop)")
    print("-" * 50)
    
    try:
        # Start the server using the main.py file
        subprocess.run([
            sys.executable, "main.py"
        ])
    except KeyboardInterrupt:
        print("\n\n🛑 Backend server stopped")
        print("👋 Thank you for using Faredown!")
    except FileNotFoundError:
        print("❌ Python not found. Please install Python 3.8+")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure you're in the project root directory")
        print("2. Install Python dependencies: pip install -r backend/requirements.txt")
        print("3. Check that port 8000 is available")
        sys.exit(1)

if __name__ == "__main__":
    main()
