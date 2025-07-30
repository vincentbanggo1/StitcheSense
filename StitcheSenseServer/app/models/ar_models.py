"""
Data models for AR dress augmentation and fitting sessions
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class DressType(str, Enum):
    """Available dress types for AR fitting"""
    EVENING_GOWN = "evening_gown"
    WEDDING_DRESS = "wedding_dress"
    COCKTAIL_DRESS = "cocktail_dress"
    FORMAL_GOWN = "formal_gown"
    CASUAL_DRESS = "casual_dress"
    PROM_DRESS = "prom_dress"


class DressStyle(str, Enum):
    """Dress style variations"""
    A_LINE = "a_line"
    BALL_GOWN = "ball_gown"
    MERMAID = "mermaid"
    SHEATH = "sheath"
    FIT_AND_FLARE = "fit_and_flare"
    EMPIRE_WAIST = "empire_waist"


class DressConfig(BaseModel):
    """Configuration for dress appearance and fitting"""
    type: DressType
    style: Optional[DressStyle] = None
    bodice_color: Optional[tuple] = (255, 182, 193)  # RGB tuple
    skirt_color: Optional[tuple] = (176, 196, 222)
    sleeve_color: Optional[tuple] = None
    opacity: float = Field(default=0.7, ge=0.1, le=1.0)
    include_sleeves: bool = True
    include_train: bool = False
    include_veil: bool = False
    neckline_style: Optional[str] = "default"
    hem_length: Optional[str] = "floor"  # floor, knee, midi, mini
    
    @validator('bodice_color', 'skirt_color', 'sleeve_color', pre=True)
    def validate_color(cls, v):
        if v is None:
            return v
        if isinstance(v, (list, tuple)):
            if len(v) != 3:
                raise ValueError('Color must be RGB tuple with 3 values')
            if not all(0 <= val <= 255 for val in v):
                raise ValueError('RGB values must be between 0 and 255')
            return tuple(v)
        raise ValueError('Color must be RGB tuple')


class ARMeasurement(BaseModel):
    """Body measurements from AR detection"""
    shoulder_width: Optional[float] = None
    bust_circumference: Optional[float] = None
    waist_circumference: Optional[float] = None
    hip_circumference: Optional[float] = None
    torso_length: Optional[float] = None
    arm_length: Optional[float] = None
    leg_length: Optional[float] = None
    height: Optional[float] = None
    confidence_score: float = Field(ge=0.0, le=1.0)
    measurement_unit: str = "pixels"  # or "cm", "inches"


class ARFrameResult(BaseModel):
    """Result from processing a single AR frame"""
    success: bool
    frame_data: Optional[str] = None  # Base64 encoded image
    measurements: Optional[ARMeasurement] = None
    pose_confidence: float = Field(ge=0.0, le=1.0)
    dress_config: Optional[DressConfig] = None
    processing_time_ms: Optional[float] = None
    error_message: Optional[str] = None


class ARSessionStats(BaseModel):
    """Statistics for an AR fitting session"""
    session_id: str
    user_id: str
    duration_seconds: float
    frame_count: int
    average_fps: float
    current_dress_type: Optional[DressType] = None
    pose_detection_success_rate: float = Field(ge=0.0, le=1.0)
    started_at: datetime
    last_activity: datetime


class ARFittingRecord(BaseModel):
    """Saved AR fitting session record"""
    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    session_id: str
    dress_type: DressType
    dress_config: DressConfig
    measurements: Optional[ARMeasurement] = None
    satisfaction_rating: Optional[int] = Field(None, ge=1, le=5)
    user_notes: Optional[str] = None
    final_frame: Optional[str] = None  # Base64 encoded final image
    duration_seconds: float
    frame_count: int
    created_at: datetime
    
    class Config:
        allow_population_by_field_name = True


class ARFittingCreate(BaseModel):
    """Data for creating a new AR fitting record"""
    dress_type: DressType
    dress_config: DressConfig
    measurements: Optional[ARMeasurement] = None
    satisfaction_rating: Optional[int] = Field(None, ge=1, le=5)
    user_notes: Optional[str] = None
    final_frame: Optional[str] = None


class ARFittingUpdate(BaseModel):
    """Data for updating an AR fitting record"""
    satisfaction_rating: Optional[int] = Field(None, ge=1, le=5)
    user_notes: Optional[str] = None


class DressTemplate(BaseModel):
    """Template for dress configurations"""
    id: str
    name: str
    type: DressType
    style: Optional[DressStyle] = None
    description: str
    preview_image: Optional[str] = None  # URL or base64
    config: DressConfig
    is_premium: bool = False
    tags: List[str] = []


class DressCustomization(BaseModel):
    """User customizations for a dress template"""
    template_id: str
    bodice_color: Optional[tuple] = None
    skirt_color: Optional[tuple] = None
    sleeve_color: Optional[tuple] = None
    opacity: Optional[float] = Field(None, ge=0.1, le=1.0)
    include_sleeves: Optional[bool] = None
    include_train: Optional[bool] = None
    include_veil: Optional[bool] = None
    neckline_style: Optional[str] = None
    hem_length: Optional[str] = None


class ARSessionMessage(BaseModel):
    """WebSocket message structure for AR sessions"""
    type: str  # frame, change_dress, get_session_info, ping
    session_id: Optional[str] = None
    frame_data: Optional[str] = None  # Base64 encoded
    dress_config: Optional[Dict[str, Any]] = None
    timestamp: Optional[float] = None
    data: Optional[Dict[str, Any]] = None


class ARAnalytics(BaseModel):
    """User AR usage analytics"""
    user_id: str
    total_sessions: int
    total_duration_hours: float
    favorite_dress_types: List[Dict[str, Any]]
    average_session_duration: float
    average_satisfaction_rating: Optional[float] = None
    most_recent_session: Optional[datetime] = None
    dress_type_preferences: Dict[str, int]


class ARSystemHealth(BaseModel):
    """System health check for AR service"""
    status: str  # healthy, degraded, unhealthy
    active_sessions: int
    tensorflow_available: bool
    mediapipe_available: bool
    gpu_available: bool
    memory_usage_mb: Optional[float] = None
    cpu_usage_percent: Optional[float] = None
    average_processing_time_ms: Optional[float] = None
    error_rate_percent: Optional[float] = None
    uptime_seconds: Optional[float] = None
