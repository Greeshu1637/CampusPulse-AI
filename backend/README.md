# CampusPulse AI - Backend API

Production-ready Flask backend for CampusPulse AI Smart University Management Platform.

## 🏗️ Architecture

### Application Structure
```
backend/
├── app.py                 # Application entry point & factory
├── config.py             # Configuration classes
├── __init__.py           # Package initialization
├── routes/               # Blueprint routes
│   ├── __init__.py
│   ├── auth.py          # Authentication routes
│   └── dashboard.py     # Dashboard API routes
├── models/               # Database models (to be implemented)
│   ├── __init__.py
│   └── user.py          # User model
├── services/             # Business logic layer
│   └── auth_service.py  # Authentication service
├── static/               # Static files (served from frontend)
└── templates/            # HTML templates (served from frontend)
```

### Design Patterns
- **Application Factory**: Creates Flask app instances for different environments
- **Blueprint Architecture**: Modular route organization
- **Service Layer**: Business logic separated from routes
- **Configuration Classes**: Environment-specific settings

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server**
   ```bash
   python backend/app.py
   ```

   Or using Flask CLI:
   ```bash
   export FLASK_APP=backend/app.py  # Linux/Mac
   set FLASK_APP=backend/app.py     # Windows
   flask run
   ```

The server will start at `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/login` | Login page |
| POST | `/auth/login` | User login |
| POST/GET | `/auth/logout` | User logout |
| GET | `/auth/check-session` | Check session validity |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |

### Dashboard API (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Main dashboard data |
| GET | `/api/kpis` | KPI metrics |
| GET | `/api/analytics/students` | Student analytics |
| GET | `/api/analytics/complaints` | Complaint trends |
| GET | `/api/analytics/classrooms` | Classroom utilization |
| GET | `/api/analytics/mess` | Mess food analytics |
| GET | `/api/ai-insights` | AI-generated insights |
| GET | `/api/export/report` | Export analytics report |

### Root Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main dashboard (serves frontend) |
| GET | `/health` | Health check endpoint |

## 🔒 Authentication

Currently uses **session-based authentication** with mock users:

### Test Users
| Email | Password | Role |
|-------|----------|------|
| student@campuspulse.edu | student123 | Student |
| admin@campuspulse.edu | admin123 | Admin |
| maintenance@campuspulse.edu | maintenance123 | Maintenance |
| mess@campuspulse.edu | mess123 | Mess Manager |

### Login Example
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@campuspulse.edu",
    "password": "admin123",
    "role": "admin"
  }'
```

## ⚙️ Configuration

### Environment Variables
See `.env.example` for all configuration options.

### Configuration Classes
- `DevelopmentConfig`: Local development (SQLite, debug enabled)
- `TestingConfig`: Unit testing (in-memory database)
- `ProductionConfig`: Production deployment (PostgreSQL, security enabled)

Select configuration using `FLASK_ENV` environment variable:
```bash
export FLASK_ENV=development  # or production, testing
```

## 🗄️ Database (To Be Implemented)

### Current Status
- Using **mock data** for development
- **SQLite** configured as fallback
- Ready for **PostgreSQL** integration

### Implementation Plan
1. Install SQLAlchemy dependencies
2. Create database migrations with Flask-Migrate
3. Implement User model with password hashing
4. Add Student, Faculty, Complaint, Classroom models
5. Replace mock data with database queries

### Migration Commands (when implemented)
```bash
flask db init          # Initialize migrations
flask db migrate -m "Initial migration"  # Create migration
flask db upgrade       # Apply migration
```

## 🛡️ Security Features

### Implemented
- Session-based authentication
- Session cookies with HttpOnly flag
- CSRF protection ready
- Secure session configuration
- Error handling

### To Implement
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## 📊 Monitoring & Health

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "CampusPulse AI Backend",
  "version": "1.0.0",
  "environment": "development"
}
```

## 🧪 Testing (To Be Implemented)

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend

# Run specific test file
pytest tests/test_auth.py
```

## 🚢 Production Deployment

### Using Gunicorn
```bash
gunicorn -w 4 -b 0.0.0.0:5000 "backend.app:create_app()"
```

### Using Docker (Dockerfile to be created)
```bash
docker build -t campuspulse-backend .
docker run -p 5000:5000 campuspulse-backend
```

### Environment Checklist
- [ ] Set strong `SECRET_KEY`
- [ ] Configure PostgreSQL `DATABASE_URL`
- [ ] Set `FLASK_ENV=production`
- [ ] Configure Redis for sessions
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure logging
- [ ] Set up HTTPS
- [ ] Configure CORS properly
- [ ] Enable rate limiting

## 📝 Development Notes

### Adding New Routes
1. Create blueprint in `routes/` directory
2. Register blueprint in `app.py`
3. Add route handlers with docstrings
4. Update this README with endpoints

### Adding New Models
1. Create model in `models/` directory
2. Define SQLAlchemy columns and relationships
3. Import model in `models/__init__.py`
4. Create database migration

### Adding New Services
1. Create service in `services/` directory
2. Implement business logic methods
3. Use service in route handlers

## 🔧 Troubleshooting

### Common Issues

**Issue**: Module not found
```bash
# Solution: Ensure you're in project root and virtual environment is activated
pip install -r requirements.txt
```

**Issue**: Port already in use
```bash
# Solution: Change port in .env or kill process
export FLASK_PORT=8000
```

**Issue**: Template not found
```bash
# Solution: Check template_folder path in app.py
# Ensure frontend files exist in ../frontend/pages
```

## 📚 Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Flask-Login Documentation](https://flask-login.readthedocs.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

When contributing to the backend:
1. Follow PEP 8 style guide
2. Add docstrings to all functions
3. Update README for new endpoints
4. Write tests for new features
5. Keep services separate from routes

## 📄 License

This project is part of CampusPulse AI Smart University Management Platform.

---

**Status**: Backend foundation complete, ready for database integration.

**Next Steps**:
1. Set up PostgreSQL database
2. Implement User model with authentication
3. Create database migrations
4. Add remaining models (Student, Complaint, etc.)
5. Implement JWT authentication
6. Add unit tests
7. Set up production deployment
