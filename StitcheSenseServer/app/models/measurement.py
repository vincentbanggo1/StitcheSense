from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Dict, Optional, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetJsonSchemaHandler
    ) -> core_schema.CoreSchema:
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

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return {"type": "string"}


class MeasurementBase(BaseModel):
    measurements: Dict[str, float] = Field(..., description="Body measurements in inches")
    confidence_score: float = Field(default=0.8, ge=0.0, le=1.0)
    image_filename: Optional[str] = Field(None, description="Original image filename")


class MeasurementCreate(MeasurementBase):
    user_id: str = Field(..., description="User ID who owns this measurement")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserMeasurement(MeasurementBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    created_at: datetime
    updated_at: datetime
    manual_measurements: Optional[Dict[str, float]] = None
    accuracy_metrics: Optional[Dict[str, Dict[str, float]]] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class MeasurementUpdate(BaseModel):
    measurements: Optional[Dict[str, float]] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    manual_measurements: Optional[Dict[str, float]] = None


class MeasurementResponse(BaseModel):
    success: bool
    measurement_id: Optional[str] = None
    measurements: Optional[Dict[str, float]] = None
    confidence: Optional[float] = None
    message: str
    error: Optional[str] = None
