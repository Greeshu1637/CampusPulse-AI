# CampusPulse AI - Configuration Checklist

## 📋 Pre-Launch Checklist for Sprint 1

Complete these steps before running the application.

---

## ✅ Step 1: Install Prerequisites

- [ ] Python 3.9+ installed
  ```bash
  python --version
  ```

- [ ] PostgreSQL 13+ installed and running
  ```bash
  # Windows
  sc query postgresql
  
  # Mac/Linux
  pg_isready
  ```

- [ ] Git installed
  ```bash
  git --version
  ```

---

## ✅ Step 2: Create PostgreSQL Database

Open terminal and run:

```bash
psql -U postgres
```

Then execute:

```sql
-- Create database
CREATE DATABASE campuspulse_ai;

-- Verify
\l campuspulse_ai

-- Exit
\q
```

**Status**: [ ] Database created

---

## ✅ Step 3: Setup Google OAuth 2.0

### 3.1 Create Google Cloud Project

- [ ] Go to https://console.cloud.google.com/
- [ ] Click "Create Project"
- [ ] Project Name: `CampusPulse AI`
- [ ] Click "Create"

### 3.2 Enable Google+ API

- [ ] In project dashboard, click "APIs & Services"
- [ ] Click "Enable APIs and Services"
- [ ] Search for "Google+ API" or "Google Identity"
- [ ] Click "Enable"

### 3.3 Configure OAuth Consent Screen

- [ ] Go to "APIs & Services" > "OAuth consent screen"
- [ ] User Type: Select "Internal" (for organization) or "External"
- [ ] App name: `CampusPulse AI`
- [ ] User support email: your-email@domain.com
- [ ] Developer contact: your-email@domain.com
- [ ] Click "Save and Continue"
- [ ] Scopes: Click "Add or Remove Scopes"
  - [ ] Select: `.../auth/userinfo.email`
  - [ ] Select: `.../auth/userinfo.profile`
  - [ ] Select: `openid`
- [ ] Click "Save and Continue"

### 3.4 Create OAuth Client ID

- [ ] Go to "APIs & Services" > "Credentials"
- [ ] Click "Create Credentials" > "OAuth client ID"
- [ ] Application type: **Web application**
- [ ] Name: `CampusPulse AI Web Client`
- [ ] Authorized JavaScript origins:
  - [ ] Add: `http://localhost:5000`
- [ ] Authorized redirect URIs:
  - [ ] Add: `http://localhost:5000/auth/callback`
- [ ] Click "Create"
- [ ] **Copy Client ID**: `________________________.apps.googleusercontent.com`
- [ ] **Copy Client Secret**: `________________________`

**Status**: [ ] OAuth credentials obtained

---

## ✅ Step 4: Create Virtual Environment

```bash
# Navigate to project directory
cd campuspulse-ai

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Verify activation (should show venv path)
where python  # Windows
which python  # Mac/Linux
```

**Status**: [ ] Virtual environment created and activated

---

## ✅ Step 5: Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected output**: Successfully installed 25+ packages

**Status**: [ ] Dependencies installed

---

## ✅ Step 6: Configure Environment Variables

### 6.1 Copy Template

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

### 6.2 Generate Secret Keys

```bash
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
```

Copy the output values.

### 6.3 Edit .env File

Open `.env` in text editor and fill in:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=<paste generated secret key>

# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/campuspulse_ai

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=<paste from step 3.4>
GOOGLE_CLIENT_SECRET=<paste from step 3.4>
OAUTHLIB_INSECURE_TRANSPORT=1

# JWT Configuration
JWT_SECRET_KEY=<paste generated JWT secret key>

# Application Configuration
APP_NAME=CampusPulse AI
APP_URL=http://localhost:5000
```

**Checklist**:
- [ ] SECRET_KEY filled
- [ ] DATABASE_URL filled (with your PostgreSQL password)
- [ ] GOOGLE_CLIENT_ID filled
- [ ] GOOGLE_CLIENT_SECRET filled
- [ ] JWT_SECRET_KEY filled

---

## ✅ Step 7: Initialize Database

```bash
# Initialize Flask-Migrate
flask db init

# Create initial migration
flask db migrate -m "Initial migration with User model"

# Apply migration to database
flask db upgrade
```

### Verify Database Tables

```bash
psql -U postgres -d campuspulse_ai -c "\dt"
```

**Expected output**: Should show `users` and `alembic_version` tables

**Status**: [ ] Database tables created

---

## ✅ Step 8: Run Application

```bash
python run.py
```

**Expected output**:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

**Status**: [ ] Application running without errors

---

## ✅ Step 9: Test Authentication

### 9.1 Check Status (Unauthenticated)

Open browser: `http://localhost:5000/auth/status`

**Expected**:
```json
{
  "success": true,
  "authenticated": false,
  "user": null
}
```

- [ ] Status endpoint works

### 9.2 Test Login

Open browser: `http://localhost:5000/auth/login`

**Expected**: Redirects to Google sign-in

- [ ] Login redirects to Google

### 9.3 Complete Google Sign-In

- [ ] Select Google account
- [ ] Grant permissions
- [ ] Redirects to `/auth/callback`
- [ ] Shows JSON with user data

### 9.4 Check Authenticated Status

Open browser: `http://localhost:5000/auth/me`

**Expected**: Shows your user data

- [ ] User profile endpoint works

### 9.5 Verify Database

```bash
psql -U postgres -d campuspulse_ai
```

```sql
SELECT id, email, name, role, is_active FROM users;
```

**Expected**: Your user record exists

- [ ] User saved in database
- [ ] Role is 'student'
- [ ] is_active is true

### 9.6 Test Logout

Open browser: `http://localhost:5000/auth/logout`

**Expected**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

- [ ] Logout works

---

## ✅ Step 10: Final Verification

- [ ] Application runs without errors
- [ ] Can login with Google account
- [ ] User is created in database
- [ ] Can view user profile
- [ ] Can logout successfully
- [ ] Database migrations applied
- [ ] All environment variables configured
- [ ] Virtual environment working

---

## 🎯 Sprint 1 Complete!

If all checkboxes are checked, Sprint 1 is successfully configured and tested.

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed

**Error**: `sqlalchemy.exc.OperationalError`

**Solution**:
1. Check PostgreSQL is running: `sc query postgresql`
2. Verify DATABASE_URL in `.env` has correct password
3. Test connection: `psql -U postgres -d campuspulse_ai`

### Issue: Google OAuth Error

**Error**: `oauthlib.oauth2.rfc6749.errors.InvalidClientError`

**Solution**:
1. Verify GOOGLE_CLIENT_ID in `.env` matches Google Console
2. Verify GOOGLE_CLIENT_SECRET in `.env` matches Google Console
3. Check redirect URI in Google Console is: `http://localhost:5000/auth/callback`

### Issue: Module Not Found

**Error**: `ModuleNotFoundError: No module named 'flask'`

**Solution**:
1. Ensure virtual environment is activated: `venv\Scripts\activate`
2. Reinstall dependencies: `pip install -r requirements.txt`

### Issue: Migration Failed

**Error**: `alembic.util.exc.CommandError`

**Solution**:
1. Delete `migrations` folder
2. Run `flask db init` again
3. Run `flask db migrate -m "Initial migration"`
4. Run `flask db upgrade`

---

## 📞 Need Help?

Refer to:
- `README.md` - Complete setup guide
- `SPRINT_1_SUMMARY.md` - Implementation details
- `ARCHITECTURE.md` - System architecture

---

**Configuration Checklist Version**: 1.0  
**Sprint**: 1 of 6  
**Last Updated**: July 30, 2026
