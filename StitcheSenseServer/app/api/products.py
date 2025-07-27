from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.models.product import ProductCreate, ProductUpdate, Product, GownCategory
from app.services.product_service import ProductService
from app.core.security import get_current_user

router = APIRouter()
product_service = ProductService()

@router.get("/", response_model=List[Product])
async def get_products(
    skip: int = Query(0, ge=0, description="Number of products to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of products to return"),
    category: Optional[GownCategory] = Query(None, description="Filter by category"),
    is_featured: Optional[bool] = Query(None, description="Filter by featured status")
):
    """Get all products with filtering and pagination"""
    try:
        products = await product_service.get_all_products(
            skip=skip,
            limit=limit,
            category=category,
            is_featured=is_featured
        )
        return products
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get products: {str(e)}"
        )

@router.get("/search", response_model=List[Product])
async def search_products(
    q: str = Query(..., description="Search term"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Search products by name, description, fabric, or color"""
    try:
        products = await product_service.search_products(
            search_term=q,
            skip=skip,
            limit=limit
        )
        return products
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )

@router.get("/category/{category}", response_model=List[Product])
async def get_products_by_category(category: GownCategory):
    """Get products by category"""
    try:
        products = await product_service.get_products_by_category(category)
        return products
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get products by category: {str(e)}"
        )

@router.get("/featured", response_model=List[Product])
async def get_featured_products(
    limit: int = Query(10, ge=1, le=50, description="Number of featured products to return")
):
    """Get featured products"""
    try:
        products = await product_service.get_featured_products(limit=limit)
        return products
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get featured products: {str(e)}"
        )

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get product by ID"""
    try:
        product = await product_service.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get product: {str(e)}"
        )

# Admin routes (require authentication and admin role)
@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new product (admin only)"""
    # Check if user is admin
    from app.services.user_service import UserService
    user_service = UserService()
    user = await user_service.get_user_by_email(current_user["email"])
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        product = await product_service.create_product(product_data)
        return Product(**product.dict())
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update product (admin only)"""
    # Check if user is admin
    from app.services.user_service import UserService
    user_service = UserService()
    user = await user_service.get_user_by_email(current_user["email"])
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        product = await product_service.update_product(product_id, product_data)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete product (admin only)"""
    # Check if user is admin
    from app.services.user_service import UserService
    user_service = UserService()
    user = await user_service.get_user_by_email(current_user["email"])
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        success = await product_service.delete_product(product_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return {"message": "Product deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete product: {str(e)}"
        )

@router.patch("/{product_id}/stock")
async def update_product_stock(
    product_id: str,
    quantity: int,
    current_user: dict = Depends(get_current_user)
):
    """Update product stock quantity (admin only)"""
    # Check if user is admin
    from app.services.user_service import UserService
    user_service = UserService()
    user = await user_service.get_user_by_email(current_user["email"])
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        success = await product_service.update_stock(product_id, quantity)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return {"message": "Stock updated successfully", "new_quantity": quantity}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update stock: {str(e)}"
        )
