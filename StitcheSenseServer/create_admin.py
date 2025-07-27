import asyncio
import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import connect_to_mongo, close_mongo_connection
from app.services.user_service import UserService
from app.models.user import UserCreate

async def create_admin_user():
    """Create an admin user"""
    await connect_to_mongo()
    
    user_service = UserService()
    
    # Check if admin already exists
    admin_email = "admin@stitchesense.com"
    existing_admin = await user_service.get_user_by_email(admin_email)
    
    if existing_admin:
        print(f"Admin user {admin_email} already exists!")
        return
    
    # Create admin user
    admin_data = UserCreate(
        email=admin_email,
        password="admin123",
        first_name="Admin",
        last_name="User"
    )
    
    try:
        # Create the user
        user = await user_service.create_user(admin_data)
        
        # Update the user role to admin
        collection = await user_service.get_collection()
        await collection.update_one(
            {"email": admin_email},
            {"$set": {"role": "admin"}}
        )
        
        print(f"✅ Admin user created successfully!")
        print(f"Email: {admin_email}")
        print(f"Password: admin123")
        print(f"Role: admin")
        
    except Exception as e:
        print(f"❌ Failed to create admin user: {e}")
    
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
