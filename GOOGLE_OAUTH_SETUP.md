# Google OAuth 2.0 Setup Guide for CampusPulse AI

Complete step-by-step guide to configure Google OAuth 2.0 authentication.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Console Setup](#google-cloud-console-setup)
3. [Backend Configuration](#backend-configuration)
4. [Testing OAuth Flow](#testing-oauth-flow)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Google Account (personal or organization)
- CampusPulse AI backend installed
- Python environment activated
- Dependencies installed (`pip install -r requirements.txt`)

---

## Google Cloud Console Setup

### Step 1: Create Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter project details:
   - **Project Name:** `CampusPulse AI`
   - **Organization:** (optional)
   - **Location:** (optional)
4. Click **Create**
5. Wait for project creation (30-60 seconds)

### Step 2: Enable Required APIs

1. Navigate to **APIs & Services** → **Library**
2. Search and enable the following APIs:
   - **Google+ API**
   - **People API**
   - **Google Identity Toolkit API** (optional, for advanced features)

### Step 3: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**

2. Select **User Type:**
   - **Internal:** For organization-only access (Google Workspace required)
   - **External:** For public access (recommended for development)

3. Click **Create**

4. Fill **OAuth consent screen** form:

   **App Information:**
   - **App name:** `CampusPulse AI`
   - **User support email:** `your-email@example.com`
   - **App logo:** (optional) Upload 120x120px logo

   **App domain:**
   - **Application home page:** `http://localhost:5000`
   - **Application privacy policy link:** (optional)
   - **Application terms of service link:** (optional)

   **Authorized domains:**
   - Add `localhost` (for development)
   - Add your production domain later

   **Developer contact information:**
   - **Email addresses:** `your-email@example.com`

5. Click **Save and Continue**

6. **Scopes:**
   - Click **Add or Remove Scopes**
   - Select the following scopes:
     - `.../auth/userinfo.email` - See your primary email address
     - `.../auth/userinfo.profile` - See your personal info
     - `openid` - Associate you with your personal info
   - Click **Update**
   - Click **Save and Continue**

7. **Test users** (for External apps in testing):
   - Click **Add Users**
   - Add email addresses of test users
   - Click **Add**
   - Click **Save and Continue**

8. **Summary:**
   - Review your configuration
   - Click **Back to Dashboard**

### Step 4: Create OAuth 2.0 Client ID

1. Navigate to **APIs & Services** → **Credentials**

2. Click **Create Credentials** → **OAuth client ID**

3. Select **Application type:**
   - **Web application**

4. Enter **Name:**
   - `CampusPulse AI Web Client`

5. Configure **Authorized JavaScript origins:**
   
   Click **Add URI** and add:
   ```
   http://localhost:5000
   ```
   
   For production, add:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

6. Configure **Authorized redirect URIs:**
   
   Click **Add URI** and add:
   ```
   http://localhost:5000/auth/google/callback
   ```
   
   For production, add:
   ```
   https://yourdomain.com/auth/google/callback
   https://www.yourdomain.com/auth/google/callback
   ```

7. Click **Create**

8. **Copy Credentials:**
   - A dialog will show your **Client ID** and **Client Secret**
   - Click **Download JSON** (optional, for backup)
   - Copy **Client ID** - looks like: `123456789-abc123.apps.googleusercontent.com`
   - Copy **Client Secret** - looks like: `GOCSPX-abc123xyz789`
   - Click **OK**

---

## Backend Configuration

### Step 1: Update Environment Variables

1. Open `.env` file in project root
2. Add Google OAuth credentials:

```env
# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

### Step 2: Verify Configuration

Run the configuration check:

```bash
cd backend
python app.py
```

You should see:
```
✓ Database initialized successfully
✓ Database seeded with 4 test users
🔧 Development mode enabled
📊 Database: SQLite (development)
⚠️  Debug mode: ON
```

### Step 3: Check OAuth Status

Open a new terminal and test the OAuth status endpoint:

```bash
curl http://localhost:5000/auth/google/status
```

Expected response:
```json
{
  "configured": true,
  "client_id_set": true,
  "client_secret_set": true,
  "redirect_uri": "http://localhost:5000/auth/google/callback"
}
```

If `configured: false`, check your `.env` file.

---

## Testing OAuth Flow

### Step 1: Start Backend Server

```bash
cd backend
python app.py
```

### Step 2: Open Login Page

Open browser and navigate to:
```
http://localhost:5000/auth/login
```

### Step 3: Test Google Sign-In

1. Click **Continue with Google** button
2. You will be redirected to Google OAuth consent screen
3. Select your Google account
4. Review permissions:
   - See your email address
   - See your personal info
5. Click **Continue** or **Allow**
6. You will be redirected back to CampusPulse AI dashboard
7. Check that you're logged in (top-right shows your profile picture)

### Step 4: Verify Session

Open browser console and run:
```javascript
fetch('/auth/check-session')
  .then(r => r.json())
  .then(console.log);
```

Expected output:
```json
{
  "authenticated": true,
  "user": {
    "id": 5,
    "email": "your-email@gmail.com",
    "name": "Your Name",
    "role": "student",
    "picture": "https://lh3.googleusercontent.com/...",
    "auth_provider": "google"
  }
}
```

### Step 5: Test Logout

1. Click logout button
2. You should be redirected to login page
3. Session should be cleared

---

## Production Deployment

### Step 1: Update Google Cloud Console

1. Navigate to **Credentials** → Your OAuth Client
2. Click **Edit**
3. Add production URIs:

   **Authorized JavaScript origins:**
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

   **Authorized redirect URIs:**
   ```
   https://yourdomain.com/auth/google/callback
   https://www.yourdomain.com/auth/google/callback
   ```

4. Click **Save**

### Step 2: Update Production Environment

```env
# Production .env
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=<generate-strong-secret>

# Google OAuth (same credentials work for production)
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789

# PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Step 3: Enable HTTPS

⚠️ **IMPORTANT:** Google OAuth requires HTTPS in production.

**Options:**
- Use **Nginx** with Let's Encrypt SSL certificate
- Use **Cloudflare** for automatic HTTPS
- Use cloud provider's SSL/TLS (AWS ALB, GCP Load Balancer)

**Nginx + Certbot Example:**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure HTTPS
```

### Step 4: Publish OAuth Consent Screen (External Apps)

If you selected **External** user type:

1. Navigate to **OAuth consent screen**
2. Review app information
3. Click **Publish App**
4. Click **Confirm**

Your app will be in **In Production** status.

**Note:** For apps with sensitive scopes, Google may require verification (can take weeks).

---

## Troubleshooting

### Error: redirect_uri_mismatch

**Symptom:**
```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://localhost:5000/auth/google/callback
does not match the ones authorized for the OAuth client.
```

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Check **Authorized redirect URIs**
4. Ensure exact match: `http://localhost:5000/auth/google/callback`
5. No trailing slash, correct protocol (http vs https)

### Error: Access Blocked

**Symptom:**
```
This app isn't verified
This app hasn't been verified by Google yet.
```

**Solution (Development):**
- Click **Advanced** → **Go to CampusPulse AI (unsafe)**
- This is normal for apps in development/testing

**Solution (Production):**
- Complete Google's app verification process
- Or keep app **Internal** (for organization only)

### Error: invalid_client

**Symptom:**
```
Error 401: invalid_client
The OAuth client was not found.
```

**Solution:**
1. Check `.env` file has correct `GOOGLE_CLIENT_ID`
2. Client ID should end with `.apps.googleusercontent.com`
3. No extra spaces or quotes
4. Restart Flask server after updating `.env`

### Error: User Not Found in Session

**Symptom:**
- Redirected to dashboard but not logged in
- No profile picture shown

**Solution:**
1. Check browser console for errors
2. Verify session cookie is set:
   - Open DevTools → Application → Cookies
   - Look for `campuspulse_session`
3. Check backend logs for errors
4. Verify callback route is working:
   ```bash
   curl http://localhost:5000/auth/google/callback
   ```

### Error: ⚠️ Warning: Google OAuth credentials not configured

**Symptom:**
```
⚠️  Warning: Google OAuth credentials not configured
   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
```

**Solution:**
1. Create `.env` file (copy from `.env.example`)
2. Add credentials:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
3. Restart server

### Database Issues

**Symptom:**
- User created in database but login fails
- Duplicate email errors

**Solution:**
```python
# Reset database
python
>>> from backend.app import create_app
>>> from backend.database import db, reset_db, seed_db
>>> app = create_app()
>>> reset_db(app)  # WARNING: Deletes all data
>>> seed_db(app)
>>> exit()
```

---

## Security Checklist

### Development
- [x] Use `http://localhost` (not `127.0.0.1`)
- [x] Keep Client Secret private
- [x] Don't commit `.env` to git
- [x] Use test users for testing

### Production
- [ ] Enable HTTPS (required)
- [ ] Use strong SECRET_KEY
- [ ] Update redirect URIs to production domain
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Review OAuth scopes (minimal necessary)
- [ ] Complete Google app verification (if needed)
- [ ] Use environment variables (not hardcoded)

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Flask-OAuthlib Documentation](https://flask-oauthlib.readthedocs.io/)

---

## Support

If you encounter issues not covered in this guide:

1. Check backend logs for detailed error messages
2. Verify all configuration steps
3. Test with a different Google account
4. Check Google Cloud Console > APIs & Services > Dashboard for quota/errors

---

**Setup Complete! 🎉**

Your CampusPulse AI application now supports Google OAuth 2.0 authentication.

Users can sign in with:
- ✅ University Email + Password
- ✅ Google Account (Gmail or Google Workspace)
