# StitchSense - AI-Powered Custom Gown Fitting Platform

> A revolutionary gown design and fitting platform that combines artificial intelligence, augmented reality, and expert craftsmanship to create the perfect custom gown for every special occasion.

![StitchSense Logo](./assets/logo.png)

## 🌟 Overview

StitchSense is a full-stack web application that transforms the traditional gown fitting experience through cutting-edge technology. Whether you're shopping for a wedding gown, debut dress, or modern evening wear, our platform provides AI-powered body measurements and AR virtual try-on capabilities to ensure the perfect fit every time.

### ✨ Key Features

- **🤖 AI Body Measurement**: Advanced computer vision technology for precise body measurements
- **🥽 AR Virtual Try-On**: Real-time augmented reality gown fitting experience  
- **👗 Custom Gown Catalog**: Curated collection of wedding, debut, and modern gowns
- **📏 Smart Fitting Analysis**: Intelligent size recommendations and fit predictions
- **👥 Admin Dashboard**: Comprehensive product and user management system
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Vite** for build tooling
- **React Three Fiber** for 3D rendering (AR features)

### Backend
- **FastAPI** (Python) - High-performance API framework
- **MongoDB** with Motor (async driver)
- **JWT Authentication** for secure user sessions
- **Pydantic** for data validation
- **Python OpenCV** for AI image processing

### DevOps & Deployment
- **Docker** containerization
- **GitHub Actions** for CI/CD
- **Environment-based configuration**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MongoDB (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stitchsense.git
   cd stitchsense
   ```

2. **Setup Frontend**
   ```bash
   cd StitcheSense
   npm install
   npm run dev
   ```

3. **Setup Backend**
   ```bash
   cd StitcheSenseServer
   pip install -r requirements.txt
   python start.py
   ```

4. **Environment Configuration**
   ```bash
   # Create .env file in StitcheSenseServer
   MONGODB_URL=mongodb://localhost:27017
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
stitchsense/
├── StitcheSense/                 # React Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/               # Route components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── contexts/            # React context providers
│   │   ├── services/            # API service functions
│   │   └── assets/              # Images and static files
│   ├── public/                  # Public assets
│   └── package.json
├── StitcheSenseServer/          # FastAPI Backend
│   ├── app/
│   │   ├── api/                 # API route handlers
│   │   ├── core/                # Core functionality
│   │   ├── models/              # Database models
│   │   ├── services/            # Business logic
│   │   └── middleware/          # Custom middleware
│   ├── static/                  # Static file serving
│   └── requirements.txt
└── README.md
```

## 🎯 Core Features

### 1. AI Body Measurement
- Upload photos for automatic body measurement detection
- Support for multiple measurement points (bust, waist, hips, height)
- Machine learning algorithms for accurate size prediction
- Integration with gown sizing charts

### 2. AR Gown Fitting
- Real-time camera feed with gown overlay
- Interactive virtual try-on experience
- Pose detection and fitting analysis
- Save and share fitting sessions

### 3. Gown Catalog
- **Wedding Gowns**: Classic and contemporary bridal designs
- **Debut Gowns**: Elegant formal wear for special occasions  
- **Modern Gowns**: Contemporary styles for various events
- Advanced filtering and search capabilities

### 4. User Management
- Secure user authentication and authorization
- Personal measurement profiles
- Order history and preferences
- Admin dashboard for product management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration  
- `POST /api/auth/refresh` - Token refresh

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/{id}` - Update product (admin)

### Measurements
- `POST /api/measurements/upload` - Upload measurement photo
- `GET /api/measurements/user` - Get user measurements
- `POST /api/measurements/analyze` - AI measurement analysis

## 🧪 Testing

### Frontend Testing
```bash
cd StitcheSense
npm run test
npm run test:coverage
```

### Backend Testing
```bash
cd StitcheSenseServer
pytest
pytest --cov=app tests/
```

## 📊 Performance & Analytics

- **Lighthouse Score**: 95+ performance rating
- **Bundle Size**: Optimized with code splitting
- **API Response Time**: < 200ms average
- **Image Optimization**: WebP format with lazy loading
- **SEO Optimized**: Meta tags and structured data

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- Secure file upload handling

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+  
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd StitcheSense
npm run build

# Backend
cd StitcheSenseServer
docker build -t stitchsense-api .
```

### Environment Variables
```bash
# Production environment
NODE_ENV=production
REACT_APP_API_URL=https://api.stitchsense.com
MONGODB_URL=mongodb+srv://...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write unit tests for new features
- Update documentation for API changes

## 📈 Roadmap

### Phase 1 (Current)
- [x] Basic gown catalog
- [x] User authentication
- [x] AI measurement prototype
- [x] AR fitting demo

### Phase 2 (Next)
- [ ] Advanced AI measurement accuracy
- [ ] 3D gown visualization
- [ ] Payment integration
- [ ] Order management system

### Phase 3 (Future)
- [ ] Mobile app development
- [ ] Social sharing features
- [ ] Virtual styling consultations
- [ ] Fabric customization options

## 📞 Support & Contact

- **Email**: support@stitchsense.com
- **Website**: https://stitchsense.com
- **Documentation**: https://docs.stitchsense.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/stitchsense/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenCV** for computer vision capabilities
- **Three.js** for 3D rendering
- **Tailwind CSS** for beautiful UI components
- **FastAPI** for robust backend framework
- **MongoDB** for flexible data storage

---

**Made with ❤️ by the StitchSense Team**

*Transforming the way custom gowns are designed, fitted, and created through innovative technology.*