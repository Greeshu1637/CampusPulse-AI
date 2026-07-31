# CampusPulse AI

**AI-Powered Campus Operations & Girls Hostel Management Platform**

## Overview

CampusPulse AI is a production-quality Flask application for managing campus operations and girls hostel facilities.

**Current Status**: Sprint 1 - Foundation Complete ✅

---

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy with Flask-Migrate
- **Environment Management**: python-dotenv

---

## Project Structure

```
campuspulse-ai/
├── campuspulse/
│   ├── __init__.py          # Application factory
│   ├── config.py            # Configuration management
│   ├── routes.py            # Application routes
│   └── models.py            # Database models (placeholder)
├── migrations/              # Database migrations (after init)
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── requirements.txt         # Python dependencies
├── run.py                   # Application entry point
└── README.md                # This file
```

---

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- PostgreSQL 13 or higher
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd campuspulse-ai
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. PostgreSQL Database Setup

**Create Database:**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE campuspulse_ai;

# Exit
\q
```

**Verify Connection:**
```bash
psql -U postgres -d campuspulse_ai -c "SELECT version();"
```

### 5. Environment Configuration

**Create `.env` file:**

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

**Edit `.env` with your values:**

```env
FLASK_ENV=development
SECRET_KEY=your-generated-secret-key
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/campuspulse_ai
```

**Generate Secret Key:**
```python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 6. Initialize Database

```bash
# Initialize Flask-Migrate
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migration
flask db upgrade
```

### 7. Run Application

```bash
python run.py
```

Application will be available at: `http://localhost:5000`

---

## Testing the Application

### Test Root Endpoint

**Browser:**
```
http://localhost:5000/
```

**cURL:**
```bash
curl http://localhost:5000/
```

**Expected Response:**
```
CampusPulse AI is Running
```

---

## Development Commands

```bash
# Run development server
python run.py

# Run Flask shell (interactive Python with app context)
flask shell

# Initialize database tables
flask init-db

# Database migrations
flask db migrate -m "Description of changes"
flask db upgrade
flask db downgrade
```

---

## Configuration

### Development Config
- Debug mode: ON
- SQL Echo: ON (logs all queries)
- Database connection pooling enabled

### Production Config
- Debug mode: OFF
- SQL Echo: OFF
- Secure configuration required

---

## Sprint 1 Deliverables ✅

- [x] Complete folder structure with application factory pattern
- [x] Flask application initialization
- [x] PostgreSQL configuration with SQLAlchemy
- [x] Environment variable support with python-dotenv
- [x] requirements.txt with all dependencies
- [x] .env.example template
- [x] Flask-PostgreSQL connection configured
- [x] Simple "/" route returning "CampusPulse AI is Running"
- [x] Modern README with setup instructions

---

## What's NOT Included (As Per Sprint 1 Requirements)

- ❌ Authentication (Future Sprint)
- ❌ Dashboards (Future Sprint)
- ❌ Module pages (Future Sprint)
- ❌ Dummy data (Future Sprint)

---

## Troubleshooting

### Database Connection Error

**Error:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution:**
1. Verify PostgreSQL is running: `sc query postgresql` (Windows) or `sudo service postgresql status` (Linux/Mac)
2. Check DATABASE_URL in `.env` has correct password
3. Test connection: `psql -U postgres -d campuspulse_ai`

### Module Not Found Error

**Error:**
```
ModuleNotFoundError: No module named 'flask'
```

**Solution:**
1. Ensure virtual environment is activated
2. Reinstall dependencies: `pip install -r requirements.txt`

### Import Error

**Error:**
```
ImportError: cannot import name 'create_app'
```

**Solution:**
1. Verify you're in the project root directory
2. Check `campuspulse/__init__.py` exists
3. Ensure virtual environment is activated

---

## Project Status

### Sprint 1: Foundation ✅ (Current)
- [x] Project structure
- [x] Flask application factory
- [x] PostgreSQL configuration
- [x] Environment setup
- [x] Basic routing

### Future Sprints (Not Yet Implemented)
- [ ] Sprint 2: Authentication & User Management
- [ ] Sprint 3: Dashboard & UI
- [ ] Sprint 4: Hostel Management
- [ ] Sprint 5: Mess Management
- [ ] Sprint 6: Analytics & Reporting

---

## Database Schema

Sprint 1 has no database models yet. Models will be added in future sprints.

Current tables:
- `alembic_version` (migration tracking only)

---

## API Endpoints

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check - returns "CampusPulse AI is Running" |

---

## Contributing

This project follows a sprint-based development approach.

**Current Sprint**: Sprint 1 - Foundation  
**Status**: Complete ✅

---

## License

Proprietary - All rights reserved

---

## Contact

For questions or issues, contact the development team.

---

**Last Updated**: Sprint 1 - Foundation Complete  
**Version**: 1.0.0
