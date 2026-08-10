# CampusPulse AI - Quick Start Guide

Get your CampusPulse AI application up and running in 5 minutes!

## ⚡ Prerequisites

- Python 3.8+
- pip
- Git (optional)

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and set SECRET_KEY
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
```

**Minimal .env configuration:**
```env
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///campuspulse_dev.db
```

### 3. Start Server

```bash
# From backend directory
python app.py
```

Expected output:
```
✓ Database tables created
✓ Database seeded with 4 test users
🔧 Development mode enabled

Server running at: http://0.0.0.0:5000
```

### 4. Access Application

Open browser: **http://localhost:5000/auth/login**

## 🔐 Test Login

### Email/Password Login

**Student Account:**
- Email: `student@campuspulse.edu`
- Password: `student123`

**Admin Account:**
- Email: `admin@campuspulse.edu`
- Password: `admin123`

## 🌐 Enable Google OAuth (Optional)

### Step 1: Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable APIs: Google+ API, People API
4. Create OAuth Client ID
5. Add redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret

### Step 2: Update .env

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 3: Restart Server

```bash
# Stop server (Ctrl+C)
# Start again
python app.py
```

Now you can login with Google!

## 📚 Next Steps

- Read [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for detailed OAuth setup
- Read [backend/README.md](backend/README.md) for complete documentation
- Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change port in .env
FLASK_PORT=8000
```

**Database errors:**
```python
# Delete database file and restart
rm campuspulse_dev.db
python app.py
```

**Import errors:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

## 📊 Project Structure

```
CampusPlus-AI/
├── backend/
│   ├── app.py              # Main application
│   ├── database.py         # Database setup
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   └── services/           # Business logic
├── frontend/
│   ├── pages/              # HTML pages
│   ├── css/                # Stylesheets
│   └── js/                 # JavaScript
├── .env                    # Environment config (create this)
├── .env.example            # Example config
└── requirements.txt        # Python dependencies
```

## ✅ Success Checklist

- [ ] Dependencies installed
- [ ] .env file created
- [ ] Server starts without errors
- [ ] Can access login page
- [ ] Can login with test account
- [ ] Redirects to dashboard after login

## 🎉 You're Ready!

Your CampusPulse AI application is now running!

**What you have:**
- ✅ Secure authentication system
- ✅ Email/password login
- ✅ Google OAuth (if configured)
- ✅ Session management
- ✅ SQLite database
- ✅ Test users

**Access URLs:**
- Login: http://localhost:5000/auth/login
- Dashboard: http://localhost:5000/
- Health Check: http://localhost:5000/health

---

For detailed documentation, see [backend/README.md](backend/README.md)
