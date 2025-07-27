from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime
from app.core.database import get_database
from app.models.product import ProductCreate, ProductUpdate, ProductInDB, Product, GownCategory

class ProductService:
    def __init__(self):
        self.collection_name = "products"
    
    async def get_collection(self):
        """Get products collection"""
        db = await get_database()
        return db[self.collection_name]
    
    async def create_product(self, product_data: ProductCreate) -> ProductInDB:
        """Create a new product"""
        collection = await self.get_collection()
        
        # Create product document
        product_doc = ProductInDB(**product_data.dict())
        
        # Insert into database
        result = await collection.insert_one(product_doc.dict(by_alias=True))
        product_doc.id = result.inserted_id
        
        return product_doc
    
    async def get_product_by_id(self, product_id: str) -> Optional[Product]:
        """Get product by ID"""
        collection = await self.get_collection()
        product_doc = await collection.find_one({"_id": ObjectId(product_id)})
        
        if product_doc:
            return Product(**product_doc)
        return None
    
    async def update_product(self, product_id: str, product_data: ProductUpdate) -> Optional[Product]:
        """Update product"""
        collection = await self.get_collection()
        
        # Prepare update data
        update_data = product_data.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            result = await collection.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": update_data}
            )
            
            if result.modified_count:
                return await self.get_product_by_id(product_id)
        
        return None
    
    async def delete_product(self, product_id: str) -> bool:
        """Delete product"""
        collection = await self.get_collection()
        result = await collection.delete_one({"_id": ObjectId(product_id)})
        return result.deleted_count > 0
    
    async def get_all_products(
        self, 
        skip: int = 0, 
        limit: int = 100,
        category: Optional[GownCategory] = None,
        is_active: bool = True,
        is_featured: Optional[bool] = None
    ) -> List[Product]:
        """Get all products with filtering and pagination"""
        collection = await self.get_collection()
        
        # Build filter
        filter_query: Dict[str, Any] = {"is_active": is_active}
        
        if category:
            filter_query["category"] = category.value
        
        if is_featured is not None:
            filter_query["is_featured"] = is_featured
        
        cursor = collection.find(filter_query).skip(skip).limit(limit)
        products = await cursor.to_list(length=limit)
        
        return [Product(**product) for product in products]
    
    async def search_products(
        self, 
        search_term: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Product]:
        """Search products by name or description"""
        collection = await self.get_collection()
        
        # Create text search query
        filter_query = {
            "$and": [
                {"is_active": True},
                {
                    "$or": [
                        {"name": {"$regex": search_term, "$options": "i"}},
                        {"description": {"$regex": search_term, "$options": "i"}},
                        {"fabric": {"$regex": search_term, "$options": "i"}},
                        {"color": {"$regex": search_term, "$options": "i"}}
                    ]
                }
            ]
        }
        
        cursor = collection.find(filter_query).skip(skip).limit(limit)
        products = await cursor.to_list(length=limit)
        
        return [Product(**product) for product in products]
    
    async def get_products_by_category(self, category: GownCategory) -> List[Product]:
        """Get products by category"""
        collection = await self.get_collection()
        cursor = collection.find({"category": category.value, "is_active": True})
        products = await cursor.to_list(length=None)
        
        return [Product(**product) for product in products]
    
    async def get_featured_products(self, limit: int = 10) -> List[Product]:
        """Get featured products"""
        collection = await self.get_collection()
        cursor = collection.find({
            "is_featured": True, 
            "is_active": True
        }).limit(limit)
        products = await cursor.to_list(length=limit)
        
        return [Product(**product) for product in products]
    
    async def update_stock(self, product_id: str, quantity: int) -> bool:
        """Update product stock quantity"""
        collection = await self.get_collection()
        result = await collection.update_one(
            {"_id": ObjectId(product_id)},
            {
                "$set": {
                    "stock_quantity": quantity,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def get_products_count(self, category: Optional[GownCategory] = None) -> int:
        """Get total count of products"""
        collection = await self.get_collection()
        filter_query = {"is_active": True}
        
        if category:
            filter_query["category"] = category.value
        
        return await collection.count_documents(filter_query)

    async def get_low_stock_products(self, threshold: int = 5) -> List[Product]:
        """Get products with stock below threshold"""
        collection = await self.get_collection()
        
        filter_query = {
            "stock_quantity": {"$lte": threshold},
            "is_active": True
        }
        
        cursor = collection.find(filter_query)
        products = await cursor.to_list(length=None)
        
        return [Product(**product) for product in products]

    async def delete_product(self, product_id: str) -> bool:
        """Delete product by ID"""
        collection = await self.get_collection()
        
        result = await collection.delete_one({"_id": ObjectId(product_id)})
        return result.deleted_count > 0
