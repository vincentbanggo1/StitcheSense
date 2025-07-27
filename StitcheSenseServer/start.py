#!/usr/bin/env python3
"""
StitcheSense Server Start Script
This script starts the StitcheSense FastAPI server with proper configuration.
"""

import subprocess
import sys
import os
import time
from pathlib import Path
import json

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = ["fastapi", "uvicorn", "motor", "pymongo"]
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n💡 Run 'python install.py' to install dependencies")
        return False
    
    return True

def check_mongodb():
    """Check if MongoDB is running"""
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB is running")
        return True
    except Exception as e:
        print("❌ MongoDB is not running or not accessible")
        print(f"   Error: {str(e)}")
        print("💡 Please start MongoDB server first")
        return False

def create_admin_user():
    """Create admin user if it doesn't exist"""
    try:
        import asyncio
        from app.services.user_service import UserService
        from app.models.user import UserCreate
        
        async def create_admin():
            user_service = UserService()
            admin_email = "admin@stitchesense.com"
            
            # Check if admin user already exists
            existing_admin = await user_service.get_user_by_email(admin_email)
            if existing_admin:
                print("✅ Admin user already exists")
                return
            
            # Create admin user
            admin_data = UserCreate(
                email=admin_email,
                password="admin123",
                full_name="System Administrator",
                role="admin"
            )
            
            admin_user = await user_service.create_user(admin_data)
            if admin_user:
                print(f"✅ Created admin user: {admin_email}")
                print(f"   Password: admin123")
                print("   ⚠️  Please change the password after first login!")
            else:
                print("❌ Failed to create admin user")
        
        asyncio.run(create_admin())
        return True
        
    except Exception as e:
        print(f"⚠️  Could not create admin user: {str(e)}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("""
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║            🚀 Starting StitcheSense Server           ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    """)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check MongoDB
    if not check_mongodb():
        print("\n💡 To start MongoDB:")
        print("   Windows: net start MongoDB")
        print("   macOS/Linux: sudo systemctl start mongod")
        sys.exit(1)
    
    # Create admin user
    create_admin_user()
    
    print("\n🌟 Server Configuration:")
    print("   - Host: 0.0.0.0")
    print("   - Port: 8000")
    print("   - Environment: Development")
    print("   - Auto-reload: ✅ Enabled")
    print("   - Hot reload: ✅ Active")
    print("   - File watching: ✅ Active")
    print("   - API Docs: http://localhost:8000/docs")
    print("   - Admin Panel: http://localhost:5173/admin")
    
    print(f"\n{'='*50}")
    print("🏃 Starting server...")
    print(f"{'='*50}")
    
    try:
        # Start the server
        cmd = [
            sys.executable, "-m", "uvicorn", "main:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
            "--log-level", "info"
        ]
        
        subprocess.run(cmd)
        
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()
