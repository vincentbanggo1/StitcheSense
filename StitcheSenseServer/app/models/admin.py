from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.product import Product, ProductImage
from app.models.user import UserResponse

class AdminStats(BaseModel):
    total_users: int
    total_products: int
    active_products: int
    featured_products: int
    users_by_role: Dict[str, int]
    products_by_category: Dict[str, int]

class ProductCreateAdmin(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    category: str = Field(..., min_length=1, max_length=50)
    price: float = Field(..., gt=0)
    available_sizes: List[str] = Field(..., min_items=1)
    fabric: str = Field(..., min_length=1, max_length=100)
    color: str = Field(..., min_length=1, max_length=50)
    stock_quantity: int = Field(default=0, ge=0)
    is_featured: bool = Field(default=False)
    is_active: bool = Field(default=True)
    care_instructions: Optional[str] = None
    images: Optional[List[ProductImage]] = []

class ProductUpdateAdmin(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    available_sizes: Optional[List[str]] = None
    fabric: Optional[str] = None
    color: Optional[str] = None
    stock_quantity: Optional[int] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    care_instructions: Optional[str] = None
    images: Optional[List[ProductImage]] = None

class UserUpdateAdmin(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

class AdminDashboardData(BaseModel):
    stats: AdminStats
    recent_users: List[UserResponse]
    featured_products: List[Product]
    low_stock_products: List[Product]
