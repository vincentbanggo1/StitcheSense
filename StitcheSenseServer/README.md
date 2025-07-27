# StitcheSense API Server

A FastAPI-based backend server for StitcheSense - a custom gown rental and design platform with AI body measurement capabilities.

## Features

### Phase 1 - Core Features ✅
- **User Authentication & Management**
  - User registration and login with JWT tokens
  - Profile management (update, delete)
  - Role-based access control (admin/user)
  - Password hashing with bcrypt

- **Product Management**
  - Complete CRUD operations for gowns
  - Category-based organization (Wedding, Debut, Modern)
  - Search functionality (name, description, fabric, color)
  - Featured products system
  - Stock management
  - Image gallery support

- **Database Integration**
  - MongoDB with Motor async driver
  - Optimized indexes for performance
  - Data validation with Pydantic models

- **API Documentation**
  - Auto-generated OpenAPI/Swagger docs
  - Interactive API testing interface
  - Comprehensive endpoint documentation

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: MongoDB with Motor (async)
- **Authentication**: JWT with python-jose
- **Password Hashing**: passlib with bcrypt
- **Validation**: Pydantic v2
- **CORS**: Enabled for frontend integration
- **Documentation**: Auto-generated OpenAPI

## Project Structure

```
StitcheSenseServer/
├── app/
│   ├── __init__.py
│   ├── api/                    # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication endpoints
│   │   └── products.py        # Product management endpoints
│   ├── core/                  # Core application logic
│   │   ├── __init__.py
│   │   ├── config.py          # Application configuration
│   │   ├── database.py        # MongoDB connection
│   │   └── security.py        # JWT and password handling
│   ├── models/                # Pydantic models
│   │   ├── __init__.py
│   │   ├── product.py         # Product data models
│   │   └── user.py           # User data models
│   ├── services/              # Business logic layer
│   │   ├── __init__.py
│   │   ├── product_service.py # Product operations
│   │   └── user_service.py   # User operations
│   └── db_init.py            # Database initialization script
├── main.py                   # FastAPI application entry point
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd StitcheSenseServer
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=stitchesense

   # Security
   SECRET_KEY=your-super-secret-jwt-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Application
   PROJECT_NAME=StitcheSense API
   DEBUG=True
   ```

5. **Start MongoDB**
   - Local: Start your MongoDB service
   - Cloud: Ensure your MongoDB Atlas cluster is running

6. **Initialize Database**
   ```bash
   python -m app.db_init
   ```

7. **Run the server**
   ```bash
   python main.py
   ```

The server will start on `http://localhost:8000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile
- `DELETE /api/auth/me` - Delete current user account
- `GET /api/auth/users` - Get all users (admin only)

### Products (`/api/products`)
- `GET /api/products/` - Get all products with filters
- `GET /api/products/search` - Search products
- `GET /api/products/category/{category}` - Get products by category
- `GET /api/products/featured` - Get featured products
- `GET /api/products/{id}` - Get specific product
- `POST /api/products/` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)
- `PATCH /api/products/{id}/stock` - Update stock (admin only)

### Documentation
- `GET /api/docs` - Interactive Swagger UI
- `GET /api/redoc` - ReDoc documentation
- `GET /api/openapi.json` - OpenAPI schema

## Usage Examples

### Register a new user
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "full_name": "John Doe",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=securepassword"
```

### Get products
```bash
curl -X GET "http://localhost:8000/api/products/" \
  -H "Accept: application/json"
```

### Search products
```bash
curl -X GET "http://localhost:8000/api/products/search?q=wedding" \
  -H "Accept: application/json"
```

## Development

### Running in Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing
The API includes comprehensive error handling and validation. Use the interactive docs at `/api/docs` to test all endpoints.

### Adding New Features
1. Create models in `app/models/`
2. Implement business logic in `app/services/`
3. Add API endpoints in `app/api/`
4. Update `main.py` to include new routers

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string (unique)",
  "password_hash": "string",
  "full_name": "string",
  "phone": "string",
  "role": "user|admin",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Products Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "category": "wedding|debut|modern",
  "rental_price": "float",
  "purchase_price": "float",
  "fabric": "string",
  "color": "string",
  "sizes": ["array of strings"],
  "stock_quantity": "integer",
  "is_featured": "boolean",
  "is_active": "boolean",
  "images": ["array of strings"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- CORS configuration for frontend integration
- Input validation with Pydantic
- SQL injection prevention (NoSQL)

## Performance Optimizations

- Database indexes on frequently queried fields
- Async/await for all database operations
- Connection pooling with Motor
- Pagination for large result sets
- Efficient search with MongoDB text indexes

## Production Deployment

### Environment Variables
Set these in production:
- `MONGODB_URL`: Your production MongoDB connection string
- `SECRET_KEY`: Strong secret key for JWT signing
- `DEBUG`: Set to `False`

### Docker Deployment (Future)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Write docstrings for public methods
4. Test all endpoints before submitting
5. Update README for new features

## License

This project is part of a capstone project for educational purposes.

---

**Status**: Phase 1 Complete ✅
**Next Phase**: AI Body Measurement Integration 🚀
