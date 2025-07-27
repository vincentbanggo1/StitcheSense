#!/usr/bin/env python3
"""
StitcheSense Server Reset Script
This script resets the database and recreates initial data.
"""

import asyncio
import sys
from pathlib import Path
import json
from datetime import datetime

async def reset_database():
    """Reset the entire database"""
    try:
        from app.core.database import get_database
        
        db = await get_database()
        
        print("🗑️  Dropping existing collections...")
        
        # Drop all collections
        collections = await db.list_collection_names()
        for collection_name in collections:
            await db.drop_collection(collection_name)
            print(f"   ✅ Dropped collection: {collection_name}")
        
        print("✅ Database reset complete!")
        return True
        
    except Exception as e:
        print(f"❌ Error resetting database: {str(e)}")
        return False

async def create_sample_data():
    """Create sample data for development"""
    try:
        from app.services.user_service import UserService
        from app.services.product_service import ProductService
        from app.models.user import UserCreate
        from app.models.product import ProductCreate, GownCategory, GownSize, ProductImage
        
        user_service = UserService()
        product_service = ProductService()
        
        print("👥 Creating sample users...")
        
        # Create admin user
        admin_data = UserCreate(
            email="admin@stitchesense.com",
            password="admin123",
            full_name="System Administrator",
            role="admin"
        )
        admin_user = await user_service.create_user(admin_data)
        if admin_user:
            print("   ✅ Created admin user: admin@stitchesense.com")
        
        # Create regular users
        sample_users = [
            {
                "email": "john.doe@example.com",
                "password": "password123",
                "full_name": "John Doe",
                "role": "user"
            },
            {
                "email": "jane.smith@example.com",
                "password": "password123",
                "full_name": "Jane Smith",
                "role": "user"
            },
            {
                "email": "emily.johnson@example.com",
                "password": "password123",
                "full_name": "Emily Johnson",
                "role": "user"
            }
        ]
        
        for user_data in sample_users:
            user = UserCreate(**user_data)
            created_user = await user_service.create_user(user)
            if created_user:
                print(f"   ✅ Created user: {user_data['email']}")
        
        print("\n👗 Creating sample products...")
        
        # Sample wedding gowns
        wedding_gowns = [
            {
                "name": "Elegant Lace Wedding Gown",
                "description": "A stunning lace wedding gown with intricate beadwork and a flowing train. Perfect for your special day.",
                "category": GownCategory.WEDDING,
                "price": 1299.99,
                "available_sizes": [GownSize.S, GownSize.M, GownSize.L, GownSize.XL],
                "images": [
                    ProductImage(url="/api/static/wedding-gown-1.jpg", alt_text="Elegant Lace Wedding Gown", is_primary=True)
                ],
                "is_active": True,
                "is_featured": True,
                "stock_quantity": 15,
                "fabric": "Lace with Satin Lining",
                "color": "Ivory",
                "care_instructions": "Dry clean only. Store in garment bag."
            },
            {
                "name": "Classic A-Line Wedding Dress",
                "description": "Timeless A-line wedding dress with elegant simplicity and comfortable fit.",
                "category": GownCategory.WEDDING,
                "price": 899.99,
                "available_sizes": [GownSize.XS, GownSize.S, GownSize.M, GownSize.L],
                "images": [
                    ProductImage(url="/api/static/wedding-gown-2.jpg", alt_text="Classic A-Line Wedding Dress", is_primary=True)
                ],
                "is_active": True,
                "is_featured": False,
                "stock_quantity": 8,
                "fabric": "Chiffon",
                "color": "White",
                "care_instructions": "Professional cleaning recommended."
            }
        ]
        
        # Sample debut gowns
        debut_gowns = [
            {
                "name": "Sparkling Debut Ball Gown",
                "description": "A magnificent ball gown perfect for debut celebrations with sparkling details.",
                "category": GownCategory.DEBUT,
                "price": 799.99,
                "available_sizes": [GownSize.S, GownSize.M, GownSize.L],
                "images": [
                    ProductImage(url="/api/static/debut-gown-1.jpg", alt_text="Sparkling Debut Ball Gown", is_primary=True)
                ],
                "is_active": True,
                "is_featured": True,
                "stock_quantity": 3,  # Low stock for testing
                "fabric": "Tulle with Sequins",
                "color": "Rose Gold",
                "care_instructions": "Handle with care. Dry clean only."
            },
            {
                "name": "Princess Style Debut Gown",
                "description": "Feel like royalty in this princess-style debut gown with flowing layers.",
                "category": GownCategory.DEBUT,
                "price": 649.99,
                "available_sizes": [GownSize.XS, GownSize.S, GownSize.M],
                "images": [
                    ProductImage(url="/api/static/debut-gown-2.jpg", alt_text="Princess Style Debut Gown", is_primary=True)
                ],
                "is_active": True,
                "is_featured": False,
                "stock_quantity": 12,
                "fabric": "Satin and Organza",
                "color": "Blush Pink",
                "care_instructions": "Professional cleaning recommended."
            }
        ]
        
        # Sample modern gowns
        modern_gowns = [
            {
                "name": "Contemporary Cocktail Dress",
                "description": "Sleek and modern cocktail dress perfect for evening events.",
                "category": GownCategory.MODERN,
                "price": 299.99,
                "available_sizes": [GownSize.XS, GownSize.S, GownSize.M, GownSize.L, GownSize.XL],
                "images": [
                    ProductImage(url="/api/static/modern-gown-1.jpg", alt_text="Contemporary Cocktail Dress", is_primary=True)
                ],
                "is_active": True,
                "is_featured": True,
                "stock_quantity": 25,
                "fabric": "Crepe",
                "color": "Black",
                "care_instructions": "Machine washable on gentle cycle."
            }
        ]
        
        # Create all sample products
        all_products = wedding_gowns + debut_gowns + modern_gowns
        
        for product_data in all_products:
            product = ProductCreate(**product_data)
            created_product = await product_service.create_product(product)
            if created_product:
                print(f"   ✅ Created product: {product_data['name']}")
        
        print(f"\n✅ Sample data creation complete!")
        print(f"   - Created {len(sample_users) + 1} users (including admin)")
        print(f"   - Created {len(all_products)} products")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample data: {str(e)}")
        return False

async def main():
    """Main reset function"""
    print("""
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║           🔄 StitcheSense Database Reset             ║
    ║                                                      ║
    ║  WARNING: This will delete ALL existing data!       ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    """)
    
    # Confirmation prompt
    response = input("Are you sure you want to reset the database? (yes/no): ").lower().strip()
    if response not in ['yes', 'y']:
        print("❌ Reset cancelled by user")
        sys.exit(0)
    
    # Check MongoDB connection
    try:
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB connection verified")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {str(e)}")
        print("💡 Please ensure MongoDB is running")
        sys.exit(1)
    
    print(f"\n{'='*50}")
    print("🗑️  Resetting database...")
    print(f"{'='*50}")
    
    # Reset database
    if not await reset_database():
        sys.exit(1)
    
    print(f"\n{'='*50}")
    print("🌱 Creating sample data...")
    print(f"{'='*50}")
    
    # Create sample data
    if not await create_sample_data():
        print("⚠️  Sample data creation failed, but database was reset")
    
    print(f"""
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║           ✅ Database Reset Complete! ✅             ║
    ║                                                      ║
    ║  Admin credentials:                                  ║
    ║  Email: admin@stitchesense.com                       ║
    ║  Password: admin123                                  ║
    ║                                                      ║
    ║  Sample users:                                       ║
    ║  - john.doe@example.com (password123)               ║
    ║  - jane.smith@example.com (password123)             ║
    ║  - emily.johnson@example.com (password123)          ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    asyncio.run(main())
