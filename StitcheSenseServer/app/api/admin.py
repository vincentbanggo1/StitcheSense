from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from fastapi.responses import FileResponse
from typing import List, Dict, Any, Optional
import os
import uuid
from pathlib import Path
from app.models.admin import (
    AdminDashboardData, 
    ProductCreateAdmin, 
    ProductUpdateAdmin, 
    UserUpdateAdmin
)
from app.models.user import UserResponse
from app.models.product import Product
from app.services.admin_service import AdminService
from app.services.user_service import UserService
from app.core.security import get_current_user

router = APIRouter()
admin_service = AdminService()
user_service = UserService()

async def get_admin_user(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Dependency to ensure user is admin"""
    user = await user_service.get_user_by_email(current_user["email"])
    if not user or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/dashboard", response_model=AdminDashboardData)
async def get_admin_dashboard(admin_user: Dict[str, Any] = Depends(get_admin_user)):
    """Get admin dashboard data"""
    try:
        dashboard_data = await admin_service.get_dashboard_data()
        return dashboard_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get dashboard data: {str(e)}"
        )

# User Management Routes
@router.get("/users", response_model=List[UserResponse])
async def get_all_users_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Get all users (admin only)"""
    try:
        users = await admin_service.get_all_users(skip=skip, limit=limit)
        return [UserResponse.from_user_in_db(user) for user in users]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}"
        )

@router.put("/users/{user_email}", response_model=UserResponse)
async def update_user_admin(
    user_email: str,
    user_data: UserUpdateAdmin,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Update user (admin only)"""
    try:
        updated_user = await admin_service.update_user_admin(user_email, user_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse.from_user_in_db(updated_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

@router.delete("/users/{user_email}")
async def delete_user_admin(
    user_email: str,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Delete user (admin only)"""
    try:
        success = await admin_service.delete_user_admin(user_email)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

# Product Management Routes
@router.post("/products", response_model=Product)
async def create_product_admin(
    product_data: ProductCreateAdmin,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Create product (admin only)"""
    try:
        product = await admin_service.create_product_admin(product_data)
        return Product(**product.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )

@router.put("/products/{product_id}", response_model=Product)
async def update_product_admin(
    product_id: str,
    product_data: ProductUpdateAdmin,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Update product (admin only)"""
    try:
        updated_product = await admin_service.update_product_admin(product_id, product_data)
        if not updated_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return Product(**updated_product.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )

@router.delete("/products/{product_id}")
async def delete_product_admin(
    product_id: str,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Delete product (admin only)"""
    try:
        success = await admin_service.delete_product_admin(product_id)
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

@router.patch("/products/{product_id}/toggle-featured", response_model=Product)
async def toggle_product_featured(
    product_id: str,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Toggle product featured status (admin only)"""
    try:
        product = await admin_service.toggle_product_featured(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return Product(**product.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle featured status: {str(e)}"
        )

@router.patch("/products/{product_id}/toggle-active", response_model=Product)
async def toggle_product_active(
    product_id: str,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Toggle product active status (admin only)"""
    try:
        product = await admin_service.toggle_product_active(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return Product(**product.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle active status: {str(e)}"
        )

# File Upload and Management Routes
@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Upload product image and return Base64 data (admin only)"""
    import base64
    
    try:
        # Validate file type
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file_extension} not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Validate file size (max 5MB)
        content = await file.read()
        file_size = len(content)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 5MB"
            )
        
        # Determine content type
        content_type_mapping = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg', 
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif'
        }
        content_type = content_type_mapping.get(file_extension, 'image/jpeg')
        
        # Convert to Base64
        base64_data = base64.b64encode(content).decode('utf-8')
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "data": base64_data,
            "content_type": content_type,
            "size": file_size
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.delete("/images/{filename}")
async def delete_product_image(
    filename: str,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Delete product image (admin only)"""
    try:
        file_path = Path(f"static/images/products/{filename}")
        
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found"
            )
        
        # Delete file
        file_path.unlink()
        
        return {"message": "Image deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )

@router.get("/products", response_model=List[Product])
async def get_all_products_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Get all products with filters (admin only)"""
    try:
        products = await admin_service.get_products_admin(
            skip=skip,
            limit=limit,
            category=category,
            search=search,
            is_active=is_active,
            is_featured=is_featured
        )
        return [Product(**product.model_dump()) for product in products]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get products: {str(e)}"
        )

@router.get("/products/{product_id}", response_model=Product)
async def get_product_admin(
    product_id: str,
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Get single product by ID (admin only)"""
    try:
        product = await admin_service.get_product_by_id_admin(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return Product(**product.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get product: {str(e)}"
        )

@router.post("/products/bulk-update")
async def bulk_update_products(
    product_ids: List[str],
    updates: Dict[str, Any],
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Bulk update products (admin only)"""
    try:
        updated_count = await admin_service.bulk_update_products(product_ids, updates)
        return {
            "message": f"Successfully updated {updated_count} products",
            "updated_count": updated_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update products: {str(e)}"
        )

@router.delete("/products/bulk-delete")
async def bulk_delete_products(
    product_ids: List[str],
    admin_user: Dict[str, Any] = Depends(get_admin_user)
):
    """Bulk delete products (admin only)"""
    try:
        deleted_count = await admin_service.bulk_delete_products(product_ids)
        return {
            "message": f"Successfully deleted {deleted_count} products",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk delete products: {str(e)}"
        )
