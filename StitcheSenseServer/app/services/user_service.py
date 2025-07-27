from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from app.core.database import get_database
from app.core.security import get_password_hash, verify_password
from app.models.user import UserCreate, UserUpdate, UserInDB, User

class UserService:
    def __init__(self):
        self.collection_name = "users"
    
    async def get_collection(self):
        """Get users collection"""
        db = await get_database()
        return db[self.collection_name]
    
    async def create_user(self, user_data: UserCreate) -> UserInDB:
        """Create a new user"""
        collection = await self.get_collection()
        
        # Check if user already exists
        existing_user = await collection.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash the password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user document
        user_doc = UserInDB(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            hashed_password=hashed_password,
            is_active=user_data.is_active
        )
        
        # Insert into database
        result = await collection.insert_one(user_doc.dict(by_alias=True))
        user_doc.id = result.inserted_id
        
        return user_doc
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email"""
        collection = await self.get_collection()
        user_doc = await collection.find_one({"email": email})
        
        if user_doc:
            return UserInDB(**user_doc)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        collection = await self.get_collection()
        user_doc = await collection.find_one({"_id": ObjectId(user_id)})
        
        if user_doc:
            return User(**user_doc)
        return None
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user"""
        collection = await self.get_collection()
        
        # Prepare update data
        update_data = user_data.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            
            if result.modified_count:
                return await self.get_user_by_id(user_id)
        
        return None
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        collection = await self.get_collection()
        result = await collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        collection = await self.get_collection()
        cursor = collection.find().skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        
        return [User(**user) for user in users]
    
    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        """Authenticate user"""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    async def activate_user(self, user_id: str) -> bool:
        """Activate user account"""
        collection = await self.get_collection()
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0
    
    async def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        collection = await self.get_collection()
        result = await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    async def get_recent_users(self, limit: int = 10) -> List[UserInDB]:
        """Get recently created users"""
        collection = await self.get_collection()
        
        cursor = collection.find({}).sort("created_at", -1).limit(limit)
        users = await cursor.to_list(length=limit)
        
        return [UserInDB(**user) for user in users]
