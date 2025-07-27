import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.models.product import ProductCreate, ProductImage, GownCategory, GownSize
from app.services.product_service import ProductService

async def seed_gowns():
    """Seed the database with sample gown data"""
    product_service = ProductService()
    
    # Sample wedding gowns
    wedding_gowns = [
        {
            "name": "Classic White Ball Gown",
            "description": "Elegant classic ball gown with intricate lace details and beaded bodice",
            "category": GownCategory.WEDDING,
            "price": 2500.00,
            "fabric": "Tulle, Lace, Satin",
            "color": "White",
            "available_sizes": [GownSize.XS, GownSize.S, GownSize.M, GownSize.L, GownSize.XL],
            "stock_quantity": 3,
            "is_featured": True,
            "is_active": True,
            "images": [
                ProductImage(url="wedding_gown_1.jpg", alt_text="Classic White Ball Gown", is_primary=True),
                ProductImage(url="wedding_gown_1_back.jpg", alt_text="Classic White Ball Gown Back View")
            ]
        },
        {
            "name": "Modern Mermaid Gown",
            "description": "Sophisticated mermaid silhouette with off-shoulder design",
            "category": GownCategory.WEDDING,
            "price": 2800.00,
            "fabric": "Satin, Organza",
            "color": "Ivory",
            "available_sizes": [GownSize.XS, GownSize.S, GownSize.M, GownSize.L],
            "stock_quantity": 2,
            "is_featured": True,
            "is_active": True,
            "images": [
                ProductImage(url="wedding_gown_2.jpg", alt_text="Modern Mermaid Gown", is_primary=True)
            ]
        },
        {
            "name": "Vintage Lace A-Line",
            "description": "Romantic A-line gown with vintage lace patterns and chapel train",
            "category": GownCategory.WEDDING,
            "price": 2200.00,
            "fabric": "Lace, Chiffon",
            "color": "Champagne",
            "available_sizes": [GownSize.S, GownSize.M, GownSize.L, GownSize.XL],
            "stock_quantity": 4,
            "is_featured": False,
            "is_active": True,
            "images": [
                ProductImage(url="wedding_gown_3.jpg", alt_text="Vintage Lace A-Line", is_primary=True)
            ]
        }
    ]
    
    # Sample debut gowns
    debut_gowns = [
        {
            "name": "Princess Pink Ball Gown",
            "description": "Dreamy pink ball gown perfect for debut celebrations",
            "category": GownCategory.DEBUT,
            "price": 1800.00,
            "fabric": "Tulle, Satin",
            "color": "Pink",
            "available_sizes": [GownSize.XS, GownSize.S, GownSize.M, GownSize.L],
            "stock_quantity": 3,
            "is_featured": True,
            "is_active": True,
            "images": [
                ProductImage(url="debut_gown_1.jpg", alt_text="Princess Pink Ball Gown", is_primary=True)
            ]
        },
        {
            "name": "Royal Blue Debut Dress",
            "description": "Elegant royal blue gown with crystal embellishments",
            "category": GownCategory.DEBUT,
            "price": 2000.00,
            "fabric": "Satin, Organza",
            "color": "Royal Blue",
            "available_sizes": [GownSize.S, GownSize.M, GownSize.L],
            "stock_quantity": 2,
            "is_featured": True,
            "is_active": True,
            "images": [
                ProductImage(url="debut_gown_2.jpg", alt_text="Royal Blue Debut Dress", is_primary=True)
            ]
        },
        {
            "name": "Lavender Princess Gown",
            "description": "Soft lavender gown with floral appliques and flowing skirt",
            "category": GownCategory.DEBUT,
            "price": 1600.00,
            "fabric": "Tulle, Lace",
            "color": "Lavender",
            "available_sizes": [GownSize.XS, GownSize.S, GownSize.M],
            "stock_quantity": 2,
            "is_featured": False,
            "is_active": True,
            "images": [
                ProductImage(url="debut_gown_3.jpg", alt_text="Lavender Princess Gown", is_primary=True)
            ]
        }
    ]
    
    # Sample modern gowns
    modern_gowns = [
        {
            "name": "Contemporary Black Elegance",
            "description": "Sleek modern black gown for sophisticated events",
            "category": GownCategory.MODERN,
            "price": 1500.00,
            "fabric": "Crepe, Silk",
            "color": "Black",
            "available_sizes": [GownSize.XS, GownSize.S, GownSize.M, GownSize.L, GownSize.XL],
            "stock_quantity": 3,
            "is_featured": True,
            "is_active": True,
            "images": [
                ProductImage(url="modern_gown_1.jpg", alt_text="Contemporary Black Elegance", is_primary=True)
            ]
        },
        {
            "name": "Minimalist White Sheath",
            "description": "Clean lines and modern silhouette for contemporary brides",
            "category": GownCategory.MODERN,
            "price": 1800.00,
            "fabric": "Crepe, Silk",
            "color": "White",
            "available_sizes": [GownSize.S, GownSize.M, GownSize.L],
            "stock_quantity": 2,
            "is_featured": False,
            "is_active": True,
            "images": [
                ProductImage(url="modern_gown_2.jpg", alt_text="Minimalist White Sheath", is_primary=True)
            ]
        }
    ]
    
    # Combine all gowns
    all_gowns = wedding_gowns + debut_gowns + modern_gowns
    
    # Create products
    for gown_data in all_gowns:
        try:
            product_create = ProductCreate(**gown_data)
            await product_service.create_product(product_create)
            print(f"Created gown: {gown_data['name']}")
        except Exception as e:
            print(f"Error creating gown {gown_data['name']}: {str(e)}")

async def create_indexes():
    """Create database indexes for better performance"""
    from app.core.database import get_database
    
    db = await get_database()
    
    # User collection indexes
    users_collection = db["users"]
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("created_at")
    
    # Products collection indexes
    products_collection = db["products"]
    await products_collection.create_index("category")
    await products_collection.create_index("is_active")
    await products_collection.create_index("is_featured")
    await products_collection.create_index("rental_price")
    await products_collection.create_index([("name", "text"), ("description", "text")])
    
    print("Database indexes created successfully")

async def init_database():
    """Initialize database with sample data and indexes"""
    try:
        # Connect to database
        from app.core.database import connect_to_mongo
        await connect_to_mongo()
        
        # Create indexes
        await create_indexes()
        
        # Seed data
        await seed_gowns()
        
        print("Database initialization completed successfully!")
        
    except Exception as e:
        print(f"Database initialization failed: {str(e)}")
    
    finally:
        # Close connection
        from app.core.database import close_mongo_connection
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(init_database())
