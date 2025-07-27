from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Optional, List, Any, Union
from datetime import datetime
from enum import Enum
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler
    ):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

class GownCategory(str, Enum):
    WEDDING = "wedding"
    DEBUT = "debut"
    MODERN = "modern"

class GownSize(str, Enum):
    XS = "XS"
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    CUSTOM = "CUSTOM"

class ProductImage(BaseModel):
    data: str  # Base64 encoded image data
    content_type: str  # MIME type (image/jpeg, image/png, etc.)
    filename: Optional[str] = None
    alt_text: Optional[str] = None
    is_primary: bool = False

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    category: GownCategory
    price: float = Field(..., gt=0)
    available_sizes: List[GownSize] = []
    images: List[ProductImage] = []
    is_active: bool = True
    is_featured: bool = False
    stock_quantity: int = Field(default=0, ge=0)
    fabric: Optional[str] = None
    color: Optional[str] = None
    care_instructions: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[GownCategory] = None
    price: Optional[float] = None
    available_sizes: Optional[List[GownSize]] = None
    images: Optional[List[ProductImage]] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    stock_quantity: Optional[int] = None
    fabric: Optional[str] = None
    color: Optional[str] = None
    care_instructions: Optional[str] = None

class ProductInDB(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class Product(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
