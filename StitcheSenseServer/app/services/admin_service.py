from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId
from app.models.admin import AdminStats, AdminDashboardData, ProductCreateAdmin, ProductUpdateAdmin, UserUpdateAdmin
from app.models.user import UserInDB, UserResponse
from app.models.product import ProductInDB, Product
from app.services.user_service import UserService
from app.services.product_service import ProductService
from app.core.database import get_database

class AdminService:
    def __init__(self):
        self.user_service = UserService()
        self.product_service = ProductService()

    async def get_admin_stats(self) -> AdminStats:
        """Get admin dashboard statistics"""
        db = await get_database()
        
        # Get user statistics
        total_users = await db.users.count_documents({})
        users_cursor = db.users.aggregate([
            {"$group": {"_id": "$role", "count": {"$sum": 1}}}
        ])
        users_by_role = {}
        async for doc in users_cursor:
            role = doc["_id"] if doc["_id"] is not None else "user"  # Default role for None values
            users_by_role[role] = doc["count"]
        
        # Get product statistics
        total_products = await db.products.count_documents({})
        active_products = await db.products.count_documents({"is_active": True})
        featured_products = await db.products.count_documents({"is_featured": True})
        
        products_cursor = db.products.aggregate([
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ])
        products_by_category = {}
        async for doc in products_cursor:
            category = doc["_id"] if doc["_id"] is not None else "uncategorized"  # Default category for None values
            products_by_category[category] = doc["count"]
        
        return AdminStats(
            total_users=total_users,
            total_products=total_products,
            active_products=active_products,
            featured_products=featured_products,
            users_by_role=users_by_role,
            products_by_category=products_by_category
        )

    async def get_dashboard_data(self) -> AdminDashboardData:
        """Get complete admin dashboard data"""
        stats = await self.get_admin_stats()
        
        # Get recent users (last 10)
        recent_users = await self.user_service.get_recent_users(limit=10)
        
        # Get featured products
        featured_products = await self.product_service.get_featured_products()
        
        # Get low stock products
        low_stock_products = await self.product_service.get_low_stock_products(threshold=5)
        
        return AdminDashboardData(
            stats=stats,
            recent_users=[UserResponse.from_user_in_db(user) for user in recent_users],
            featured_products=featured_products,
            low_stock_products=low_stock_products
        )

    async def get_all_users(self, skip: int = 0, limit: int = 50) -> List[UserInDB]:
        """Get all users with pagination"""
        return await self.user_service.get_all_users(skip=skip, limit=limit)

    async def update_user_admin(self, user_email: str, user_data: UserUpdateAdmin) -> Optional[UserInDB]:
        """Update user as admin (can change role, active status, etc.)"""
        db = await get_database()
        
        update_data = {}
        if user_data.first_name is not None:
            update_data["first_name"] = user_data.first_name
        if user_data.last_name is not None:
            update_data["last_name"] = user_data.last_name
        if user_data.phone is not None:
            update_data["phone"] = user_data.phone
        if user_data.is_active is not None:
            update_data["is_active"] = user_data.is_active
        if user_data.role is not None:
            update_data["role"] = user_data.role
        
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.users.find_one_and_update(
            {"email": user_email},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            return UserInDB(**result)
        return None

    async def delete_user_admin(self, user_email: str) -> bool:
        """Delete user as admin"""
        return await self.user_service.delete_user(user_email)

    async def create_product_admin(self, product_data: ProductCreateAdmin) -> ProductInDB:
        """Create product as admin"""
        db = await get_database()
        
        # Convert to ProductInDB
        product = ProductInDB(
            name=product_data.name,
            description=product_data.description,
            category=product_data.category,
            price=product_data.price,
            available_sizes=product_data.available_sizes,
            images=product_data.images or [],  # Use provided images or empty list
            fabric=product_data.fabric,
            color=product_data.color,
            stock_quantity=product_data.stock_quantity,
            is_featured=product_data.is_featured,
            is_active=product_data.is_active,
            care_instructions=product_data.care_instructions
        )
        
        result = await db.products.insert_one(product.model_dump(by_alias=True, exclude={"id"}))
        product.id = result.inserted_id
        return product

    async def update_product_admin(self, product_id: str, product_data: ProductUpdateAdmin) -> Optional[ProductInDB]:
        """Update product as admin"""
        db = await get_database()
        
        update_data = {}
        if product_data.name is not None:
            update_data["name"] = product_data.name
        if product_data.description is not None:
            update_data["description"] = product_data.description
        if product_data.category is not None:
            update_data["category"] = product_data.category
        if product_data.price is not None:
            update_data["price"] = product_data.price
        if product_data.available_sizes is not None:
            update_data["available_sizes"] = product_data.available_sizes
        if product_data.images is not None:
            update_data["images"] = product_data.images
        if product_data.fabric is not None:
            update_data["fabric"] = product_data.fabric
        if product_data.color is not None:
            update_data["color"] = product_data.color
        if product_data.stock_quantity is not None:
            update_data["stock_quantity"] = product_data.stock_quantity
        if product_data.is_featured is not None:
            update_data["is_featured"] = product_data.is_featured
        if product_data.is_active is not None:
            update_data["is_active"] = product_data.is_active
        if product_data.care_instructions is not None:
            update_data["care_instructions"] = product_data.care_instructions
        
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.products.find_one_and_update(
            {"_id": ObjectId(product_id)},
            {"$set": update_data},
            return_document=True
        )
        
        if result:
            return ProductInDB(**result)
        return None

    async def delete_product_admin(self, product_id: str) -> bool:
        """Delete product as admin"""
        return await self.product_service.delete_product(product_id)

    async def toggle_product_featured(self, product_id: str) -> Optional[ProductInDB]:
        """Toggle product featured status"""
        db = await get_database()
        
        # Get current product
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return None
        
        # Toggle featured status
        new_featured = not product.get("is_featured", False)
        
        result = await db.products.find_one_and_update(
            {"_id": ObjectId(product_id)},
            {"$set": {"is_featured": new_featured, "updated_at": datetime.utcnow()}},
            return_document=True
        )
        
        if result:
            return ProductInDB(**result)
        return None

    async def toggle_product_active(self, product_id: str) -> Optional[ProductInDB]:
        """Toggle product active status"""
        db = await get_database()
        
        # Get current product
        product = await db.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            return None
        
        # Toggle active status
        new_active = not product.get("is_active", True)
        
        result = await db.products.find_one_and_update(
            {"_id": ObjectId(product_id)},
            {"$set": {"is_active": new_active, "updated_at": datetime.utcnow()}},
            return_document=True
        )
        
        if result:
            return ProductInDB(**result)
        return None

    async def get_products_admin(
        self, 
        skip: int = 0, 
        limit: int = 50, 
        category: str = None,
        search: str = None,
        is_active: bool = None,
        is_featured: bool = None
    ) -> List[ProductInDB]:
        """Get products with advanced filtering for admin"""
        db = await get_database()
        
        # Build filter query
        filter_query = {}
        
        if category:
            filter_query["category"] = category
        
        if is_active is not None:
            filter_query["is_active"] = is_active
            
        if is_featured is not None:
            filter_query["is_featured"] = is_featured
        
        if search:
            filter_query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"fabric": {"$regex": search, "$options": "i"}},
                {"color": {"$regex": search, "$options": "i"}}
            ]
        
        cursor = db.products.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        products = []
        async for product_doc in cursor:
            products.append(ProductInDB(**product_doc))
        
        return products

    async def get_product_by_id_admin(self, product_id: str) -> Optional[ProductInDB]:
        """Get single product by ID for admin"""
        db = await get_database()
        
        try:
            product = await db.products.find_one({"_id": ObjectId(product_id)})
            if product:
                return ProductInDB(**product)
        except Exception:
            pass
        
        return None

    async def bulk_update_products(self, product_ids: List[str], updates: Dict[str, Any]) -> int:
        """Bulk update multiple products"""
        db = await get_database()
        
        # Convert string IDs to ObjectId
        object_ids = []
        for pid in product_ids:
            try:
                object_ids.append(ObjectId(pid))
            except Exception:
                continue
        
        if not object_ids:
            return 0
        
        # Add updated_at timestamp
        updates["updated_at"] = datetime.utcnow()
        
        result = await db.products.update_many(
            {"_id": {"$in": object_ids}},
            {"$set": updates}
        )
        
        return result.modified_count

    async def bulk_delete_products(self, product_ids: List[str]) -> int:
        """Bulk delete multiple products"""
        db = await get_database()
        
        # Convert string IDs to ObjectId
        object_ids = []
        for pid in product_ids:
            try:
                object_ids.append(ObjectId(pid))
            except Exception:
                continue
        
        if not object_ids:
            return 0
        
        result = await db.products.delete_many({"_id": {"$in": object_ids}})
        return result.deleted_count

    async def get_product_stats(self) -> Dict[str, Any]:
        """Get detailed product statistics"""
        db = await get_database()
        
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_products": {"$sum": 1},
                    "active_products": {
                        "$sum": {"$cond": [{"$eq": ["$is_active", True]}, 1, 0]}
                    },
                    "featured_products": {
                        "$sum": {"$cond": [{"$eq": ["$is_featured", True]}, 1, 0]}
                    },
                    "total_stock": {"$sum": "$stock_quantity"},
                    "avg_price": {"$avg": "$price"},
                    "max_price": {"$max": "$price"},
                    "min_price": {"$min": "$price"}
                }
            }
        ]
        
        cursor = db.products.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        if result:
            stats = result[0]
            stats.pop("_id", None)  # Remove the _id field
            return stats
        
        return {
            "total_products": 0,
            "active_products": 0,
            "featured_products": 0,
            "total_stock": 0,
            "avg_price": 0,
            "max_price": 0,
            "min_price": 0
        }
