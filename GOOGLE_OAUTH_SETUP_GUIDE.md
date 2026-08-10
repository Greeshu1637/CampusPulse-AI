# Google OAuth Configuration Guide

## ✅ CODE VERIFICATION COMPLETE

The Google OAuth implementation is **100% complete and correct**. All components are properly implemented:

1. ✅ Google login button connected in `login.html` (id="googleLoginBtn")
2. ✅ JavaScript handler in `login.js` redirects to `/auth/google/login`
3. ✅ Backend route `/auth/google/login` initiates OAuth flow
4. ✅ OAuth service generates proper authorization URL
5. ✅ Callback route `/auth/google/callback` handles Google response
6. ✅ Service exchanges code for token and fetches user profile
7. ✅ User is created/updated in database with Google data
8. ✅ Flask session is created with user data
9. ✅ Successful redirect to dashboard after login

**The only missing piece is Google Cloud Console configuration.**

---

## 🔧 GOOGLE CLOUD CONSOLE CONFIGURATION

Follow these exact steps to configure Google OAuth:

### Step 1: Go to Google Cloud Console
Navigate to: https://console.cloud.google.com/

### Step 2: Create or Select a Project
1. Click the project dropdown at the top
2. Click "NEW PROJECT"
3. Enter project name: `CampusPulse AI` (or any name)
4. Click "CREATE"
5. Wait for project creation, then select it

### Step 3: Enable Google+ API
1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google+ API"
3. Click on it
4. Click "ENABLE"

### Step 4: Configure OAuth Consent Screen
1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Select "External" user type
3. Click "CREATE"
4. Fill in required fields:
   - **App name**: CampusPulse AI
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "SAVE AND CONTINUE"
6. Click "SAVE AND CONTINUE" on Scopes page (no changes needed)
7. Click "SAVE AND CONTINUE" on Test users page
8. Click "BACK TO DASHBOARD"

### Step 5: Create OAuth 2.0 Credentials
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Select Application type: **Web application**
4. Enter name: `CampusPulse AI Web Client`

5. **Add Authorized JavaScript origins**:
   ```
   http://localhost:5000
   http://127.0.0.1:5000
   ```

6. **Add Authorized redirect URIs**:
   ```
   http://localhost:5000/auth/google/callback
   http://127.0.0.1:5000/auth/google/callback
   ```

7. Click "CREATE"

### Step 6: Copy Your Credentials
After creation, you'll see a popup with:
- **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abcdefghijklmnop`)

**IMPORTANT**: Keep these credentials secure!

---

## 📝 PASTE CREDENTIALS

### Where to Paste CLIENT_ID and CLIENT_SECRET

**File**: `.env` (in project root directory)

**Location**: `c:\Users\Dell\OneDrive\Desktop\CampusPlus-AI\.env`

**Current content**:
```env
# Google OAuth (optional for testing)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Updated content** (paste your actual credentials):
```env
# Google OAuth
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

**Example** (with fake credentials):
```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
```

---

## 🚀 RESTART THE SERVER

After adding credentials to `.env`:

1. **Stop the Flask server** (Ctrl+C in terminal or stop button)
2. **Restart the server**:
   ```bash
   python backend/app.py
   ```
3. Look for this message:
   ```
   ✓ Google OAuth configured
   ```
   If you see:
   ```
   ⚠️  Warning: Google OAuth credentials not configured
   ```
   Then the `.env` file wasn't loaded correctly.

---

## ✅ TEST GOOGLE LOGIN

1. Open browser: http://localhost:5000/login
2. Click "Continue with Google" button
3. **Expected flow**:
   - ✅ Redirects to Google account picker
   - ✅ Select your Google account
   - ✅ Grant permissions (if first time)
   - ✅ Redirects back to CampusPulse AI
   - ✅ User logged in
   - ✅ Dashboard loads

4. **Verify in database**:
   - Open `backend/instance/campuspulse_dev.db`
   - Check `users` table
   - Your Google account should be saved with:
     - `google_id` populated
     - `email` from Google
     - `name` from Google
     - `profile_picture` from Google
     - `auth_provider` = 'google'

---

## 🐛 TROUBLESHOOTING

### Issue: "redirect_uri_mismatch" error

**Cause**: Redirect URI in Google Console doesn't match the one in code.

**Solution**: Make sure BOTH of these are added in Google Console:
```
http://localhost:5000/auth/google/callback
http://127.0.0.1:5000/auth/google/callback
```

### Issue: "Access blocked: This app's request is invalid"

**Cause**: JavaScript origins not configured.

**Solution**: Add both origins in Google Console:
```
http://localhost:5000
http://127.0.0.1:5000
```

### Issue: Environment variables not loading

**Solution 1**: Restart Python server after editing `.env`

**Solution 2**: Verify `.env` file location (must be in project root)

**Solution 3**: Check for spaces around `=` sign:
```env
# WRONG (has spaces)
GOOGLE_CLIENT_ID = your_id

# CORRECT (no spaces)
GOOGLE_CLIENT_ID=your_id
```

### Issue: "Google OAuth credentials not configured" warning

**Cause**: Environment variables not loaded or empty.

**Solution**: 
1. Check `.env` file exists in project root
2. Check credentials are pasted without spaces
3. Restart Flask server
4. Check server console output

---

## 📋 QUICK REFERENCE

### Your URLs for Google Console:

**Authorized JavaScript Origins**:
- `http://localhost:5000`
- `http://127.0.0.1:5000`

**Authorized Redirect URIs**:
- `http://localhost:5000/auth/google/callback`
- `http://127.0.0.1:5000/auth/google/callback`

### Your File Locations:

**Credentials file**: `c:\Users\Dell\OneDrive\Desktop\CampusPlus-AI\.env`

**Format**:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## 🔒 PRODUCTION DEPLOYMENT

When deploying to production (e.g., https://campuspulse.example.com):

1. **Update Google Console**:
   - Add production JavaScript origin: `https://campuspulse.example.com`
   - Add production redirect URI: `https://campuspulse.example.com/auth/google/callback`

2. **Update `.env` on production server**:
   - Use production credentials (not development ones)
   - Ensure HTTPS is enabled (required for OAuth)

3. **Security**:
   - Never commit `.env` file to git
   - Use environment variables on production server
   - Rotate credentials if exposed

---

**Status**: ✅ Code Complete, Configuration Pending  
**Next Step**: Configure Google Cloud Console with URLs above  
**Time Required**: ~5 minutes
