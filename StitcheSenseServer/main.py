from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api import auth, products, admin, measurements, ar_augmentation

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="StitcheSense API for gown rental and measurement service",
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Event handlers
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Create static directories if they don't exist
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)
(static_dir / "images" / "products").mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/api/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(measurements.router, prefix="/api/measurements", tags=["measurements"])
app.include_router(ar_augmentation.router, prefix="/api/ar", tags=["ar-augmentation"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to StitcheSense API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/health")
async def api_health_check():
    return {"status": "API is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
