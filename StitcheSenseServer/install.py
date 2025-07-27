#!/usr/bin/env python3
"""
StitcheSense Server Installation Script
This script sets up the development environment for the StitcheSense server.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{'='*50}")
    print(f"🔧 {description}")
    print(f"{'='*50}")
    
    try:
        if isinstance(command, str):
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        else:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
        
        if result.stdout:
            print(result.stdout)
        print(f"✅ {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during {description}:")
        print(f"Exit code: {e.returncode}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error during {description}: {str(e)}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ is required. Current version: {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible!")
    return True

def install_dependencies():
    """Install Python dependencies"""
    requirements = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "motor==3.3.2",
        "pymongo==4.6.0",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "python-multipart==0.0.6",
        "email-validator==2.1.0",
        "pydantic[email]==2.11.7",
        "pydantic-settings==2.5.2",
        "python-dotenv==1.0.0",
        "bcrypt==4.1.2"
    ]
    
    print("📦 Installing Python dependencies...")
    for requirement in requirements:
        if not run_command(f"pip install {requirement}", f"Installing {requirement}"):
            return False
    return True

def create_env_file():
    """Create .env file with default configuration"""
    env_file = Path(".env")
    if env_file.exists():
        print("📝 .env file already exists, skipping creation...")
        return True
    
    env_content = """# StitcheSense Server Configuration
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=stitchesense

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173"]

# Admin Configuration
ADMIN_EMAIL=admin@stitchesense.com
ADMIN_PASSWORD=admin123
"""
    
    try:
        with open(env_file, "w") as f:
            f.write(env_content)
        print("✅ Created .env file with default configuration")
        print("⚠️  Please update the SECRET_KEY and other settings for production!")
        return True
    except Exception as e:
        print(f"❌ Error creating .env file: {str(e)}")
        return False

def create_directories():
    """Create necessary directories"""
    directories = [
        "logs",
        "uploads",
        "static",
        "tests"
    ]
    
    for directory in directories:
        dir_path = Path(directory)
        if not dir_path.exists():
            try:
                dir_path.mkdir(parents=True, exist_ok=True)
                print(f"📁 Created directory: {directory}")
            except Exception as e:
                print(f"❌ Error creating directory {directory}: {str(e)}")
                return False
    return True

def main():
    """Main installation function"""
    print("""
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║         StitcheSense Server Installation             ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    """)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies. Please check your internet connection and try again.")
        sys.exit(1)
    
    # Create .env file
    if not create_env_file():
        print("❌ Failed to create .env file.")
        sys.exit(1)
    
    # Create directories
    if not create_directories():
        print("❌ Failed to create necessary directories.")
        sys.exit(1)
    
    print(f"""
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║         🎉 Installation Complete! 🎉                 ║
    ║                                                      ║
    ║  Next steps:                                         ║
    ║  1. Start MongoDB server                             ║
    ║  2. Run: python start.py                            ║
    ║  3. Visit: http://localhost:8000/docs                ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    main()
