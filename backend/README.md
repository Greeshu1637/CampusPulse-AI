# CampusPulse AI - Backend

Production-ready Flask backend for CampusPulse AI with Google OAuth 2.0 authentication.

## 🏗️ Architecture

```
backend/
├── app.py                      # Application entry point
├── __init__.py                 # Package initialization
├── database.py                 # Database configuration & utilities
├── models/                     # Database models
│   ├── user.py                 # User model with OAuth support
│   └── __init__.py
├── routes/                     # API routes (Blueprints)
│   ├── auth.py                 # Email/password authentication
│   ├── google_auth.py          # Google OAuth 2.0 flow
│   ├── dashboard.py            # Dashboard APIs
│   └── __init__.py
├── services/                   # Business logic layer
│   ├── auth_service.py         # Authentication service
│   ├── google_auth_service.py  # Google OAuth service
│   └── __init__.py
├── static/                     # Static files (served from frontend/)
└── templates/                  # HTML templates (served from frontend/)
```

## 🚀 Features

- ✅ **Dual Authentication**
  - Email/Password (traditional)
  - Google OAuth 2.0 (SSO)
- ✅ **Database Integration**
  - SQLAlchemy ORM
  - SQLite (development)
  - PostgreSQL-ready (production)
- ✅ **Security**
  - Password hashing (pbkdf2:sha256)
  - Secure session management
  - CSRF protection ready
  - OAuth state parameter
- ✅ **Blueprint Architecture**
  - Modular route organization
  - Service layer pattern
  - Clean separation of concerns

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)

## ⚙️ Installation

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Key Dependencies:**
- `Flask==3.0.0` - Web framework
- `Flask-SQLAlchemy==3.1.1` - Database ORM
- `google-auth==2.25.2` - Google OAuth client
- `google-auth-oauthlib==1.2.0` - OAuth 2.0 flow
- `google-auth-httplib2==0.2.0` - HTTP transport
- `Werkzeug==3.0.1` - Security utilities
- `python-dotenv==1.0.0` - Environment variables

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Flask
SECRET_KEY=your-secret-key-here-change-in-production
FLASK_ENV=development
FLASK_DEBUG=True

# Database
DATABASE_URL=sqlite:///campuspulse_dev.db

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**🔐 Generate Secure Secret Key:**

```python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Set Up Google OAuth 2.0

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API** and **People API**

#### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: `CampusPulse AI`
5. **Authorized JavaScript origins:**
   ```
   http://localhost:5000
   https://yourdomain.com
   ```
6. **Authorized redirect URIs:**
   ```
   http://localhost:5000/auth/google/callback
   https://yourdomain.com/auth/google/callback
   ```
7. Click **Create**
8. Copy **Client ID** and **Client Secret** to `.env`

#### Step 3: Configure OAuth Consent Screen

1. Navigate to **OAuth consent screen**
2. User Type: **Internal** (for organization) or **External** (public)
3. Fill required fields:
   - App name: `CampusPulse AI`
   - User support email: `your-email@example.com`
   - Developer contact: `your-email@example.com`
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. Save and continue

### 5. Initialize Database

```bash
# Run from project root
cd backend
python app.py
```

The database will be automatically created with test users:

| Email | Password | Role |
|-------|----------|------|
| `student@campuspulse.edu` | `student123` | Student |
| `admin@campuspulse.edu` | `admin123` | Admin |
| `maintenance@campuspulse.edu` | `maintenance123` | Maintenance |
| `mess@campuspulse.edu` | `mess123` | Mess Manager |

## 🎯 Running the Application

### Development Server

```bash
# From project root
cd backend
python app.py
```

Server will start at: **http://localhost:5000**

### Production Server (Gunicorn)

```bash
# Install gunicorn
pip install gunicorn

# Run with 4 worker processes
gunicorn -w 4 -b 0.0.0.0:5000 "backend.app:create_app()"
```

## 🔄 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/login` | Login page |
| `POST` | `/auth/login` | Email/password login |
| `GET/POST` | `/auth/logout` | Logout user |
| `GET` | `/auth/check-session` | Verify session |

### Google OAuth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/google/login` | Initiate OAuth flow |
| `GET` | `/auth/google/callback` | OAuth callback |
| `GET` | `/auth/google/userinfo` | Get user info |
| `GET` | `/auth/google/status` | Check OAuth config |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Get dashboard data |

## 🗃️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,          -- Google OAuth ID
    email VARCHAR(120) UNIQUE NOT NULL,      -- User email
    password_hash VARCHAR(255),              -- Hashed password (nullable for OAuth)
    name VARCHAR(100) NOT NULL,              -- Full name
    profile_picture VARCHAR(500),            -- Profile picture URL
    role VARCHAR(20) DEFAULT 'student',      -- User role
    auth_provider VARCHAR(20) DEFAULT 'email', -- Auth method
    is_active BOOLEAN DEFAULT TRUE,          -- Account status
    is_verified BOOLEAN DEFAULT FALSE,       -- Email verification
    last_login DATETIME,                     -- Last login timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Database Operations

```python
# Get user by email
from backend.models.user import get_user_by_email
user = get_user_by_email('student@campuspulse.edu')

# Get user by Google ID
from backend.models.user import get_user_by_google_id
user = get_user_by_google_id('1234567890')

# Create Google user
from backend.models.user import create_google_user
user = create_google_user(
    google_id='1234567890',
    email='user@gmail.com',
    name='John Doe',
    picture='https://lh3.googleusercontent.com/...',
    role='student'
)

# Verify password
user = get_user_by_email('student@campuspulse.edu')
if user and user.check_password('student123'):
    print('Password valid')

# Update last login
user.update_last_login()
```

## 🔐 Security Best Practices

### ✅ Implemented

- Password hashing with `werkzeug.security`
- Secure session cookies (HttpOnly, SameSite)
- OAuth state parameter for CSRF protection
- Environment variables for secrets
- Token validation

### 🚧 Recommended for Production

- [ ] Enable HTTPS (required for OAuth)
- [ ] Add rate limiting (Flask-Limiter)
- [ ] Implement CSRF protection (Flask-WTF)
- [ ] Add logging and monitoring (Sentry)
- [ ] Use Redis for sessions (Flask-Session)
- [ ] Enable CORS properly (Flask-CORS)
- [ ] Add input validation
- [ ] Implement password reset
- [ ] Add email verification
- [ ] Use PostgreSQL (not SQLite)

## 🧪 Testing

### Manual Testing

**Test Email Login:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@campuspulse.edu",
    "password": "student123",
    "role": "student"
  }'
```

**Check Session:**
```bash
curl http://localhost:5000/auth/check-session
```

**Test Google OAuth Status:**
```bash
curl http://localhost:5000/auth/google/status
```

### Unit Tests (TODO)

```bash
# Install pytest
pip install pytest pytest-flask

# Run tests
pytest tests/
```

## 🐛 Troubleshooting

### Issue: Database Not Found

```bash
# Reinitialize database
python
>>> from backend.app import create_app
>>> from backend.database import db, seed_db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
...     seed_db(app)
```

### Issue: Google OAuth Redirect Mismatch

**Error:** `redirect_uri_mismatch`

**Solution:** Ensure redirect URI in Google Console exactly matches:
```
http://localhost:5000/auth/google/callback
```

### Issue: Google OAuth Not Configured

**Error:** `⚠️ Warning: Google OAuth credentials not configured`

**Solution:** Add to `.env`:
```env
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### Issue: Import Errors

**Error:** `ModuleNotFoundError: No module named 'backend'`

**Solution:** Run from project root or add to Python path:
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

## 📚 Code Structure

### Application Factory Pattern

```python
# backend/app.py
def create_app(config_name=None):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(google_auth_bp)
    
    return app
```

### Blueprint Example

```python
# backend/routes/auth.py
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    # Authentication logic
    pass
```

### Service Layer Pattern

```python
# backend/services/auth_service.py
class AuthService:
    def authenticate_user(self, email, password):
        user = get_user_by_email(email)
        if user and user.check_password(password):
            return {'success': True, 'user': user}
        return {'success': False}
```

## 🚀 Deployment

### Environment Setup

```bash
# Production environment variables
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=<strong-random-secret>
DATABASE_URL=postgresql://user:pass@host:5432/db
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
```

### PostgreSQL Migration

```env
# Update .env
DATABASE_URL=postgresql://campuspulse_user:password@localhost:5432/campuspulse_db
```

```bash
# Install PostgreSQL adapter
pip install psycopg2-binary

# Create database
createdb campuspulse_db

# Initialize
python
>>> from backend.app import create_app
>>> from backend.database import db, seed_db
>>> app = create_app('production')
>>> with app.app_context():
...     db.create_all()
```

### Gunicorn + Nginx

**gunicorn.conf.py:**
```python
bind = "0.0.0.0:5000"
workers = 4
worker_class = "sync"
timeout = 120
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name campuspulse.ai;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues or questions:
- Email: support@campuspulse.ai
- GitHub Issues: [Link to repository]

---

**Built with ❤️ for modern campus management**
