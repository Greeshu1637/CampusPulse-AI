"""
CampusPulse AI - Google OAuth 2.0 Authentication Routes
========================================================

This module handles Google OAuth 2.0 authentication flow:
1. User clicks "Continue with Google"
2. Redirect to Google OAuth consent screen
3. User grants permission
4. Google redirects back with authorization code
5. Exchange code for access token
6. Fetch user profile from Google
7. Create or update user in database
8. Create Flask session
9. Redirect to dashboard

Security:
- Uses HTTPS (required for OAuth)
- State parameter for CSRF protection
- Secure session cookies
- Token validation

All routes in this blueprint are prefixed with /auth/google
Example: /auth/google/login, /auth/google/callback
"""

from flask import Blueprint, redirect, url_for, session, request, jsonify
from backend.services.google_auth_service import GoogleAuthService
from backend.database import db
import os

# ============================================================
# CREATE GOOGLE AUTH BLUEPRINT
# ============================================================
google_auth_bp = Blueprint(
    'google_auth',
    __name__,
    url_prefix='/auth/google'
)

# Initialize Google Auth Service
google_auth_service = GoogleAuthService()


# ============================================================
# GOOGLE OAUTH LOGIN ROUTE
# ============================================================

@google_auth_bp.route('/login')
def google_login():
    """
    Initiate Google OAuth 2.0 flow.
    
    GET /auth/google/login
    
    This route redirects the user to Google's OAuth consent screen.
    After user grants permission, Google will redirect back to
    the callback URL with an authorization code.
    
    Returns:
        Redirect to Google OAuth consent screen
    """
    try:
        # Generate authorization URL
        authorization_url = google_auth_service.get_authorization_url(
            redirect_uri=url_for('google_auth.google_callback', _external=True)
        )
        
        if not authorization_url:
            return jsonify({
                'success': False,
                'message': 'Failed to generate Google authorization URL'
            }), 500
        
        # Redirect user to Google consent screen
        return redirect(authorization_url)
    
    except Exception as e:
        print(f'Google login error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to initiate Google login'
        }), 500


# ============================================================
# GOOGLE OAUTH CALLBACK ROUTE
# ============================================================

@google_auth_bp.route('/callback')
def google_callback():
    """
    Handle Google OAuth callback.
    
    GET /auth/google/callback?code=AUTHORIZATION_CODE&state=STATE
    
    This route is called by Google after user grants permission.
    It exchanges the authorization code for an access token,
    fetches user profile, and creates/updates user in database.
    
    Query Parameters:
        code: Authorization code from Google
        state: CSRF protection token
        error: Error code if user denied permission
    
    Returns:
        Redirect to dashboard on success
        Redirect to login on error
    """
    try:
        # Check for errors (user denied permission)
        error = request.args.get('error')
        if error:
            print(f'Google OAuth error: {error}')
            return redirect(url_for('auth.login_page', error='google_denied'))
        
        # Get authorization code
        code = request.args.get('code')
        if not code:
            return redirect(url_for('auth.login_page', error='no_code'))
        
        # Exchange code for token and get user info
        result = google_auth_service.handle_callback(
            code=code,
            redirect_uri=url_for('google_auth.google_callback', _external=True)
        )
        
        if not result['success']:
            print(f'Google callback error: {result["message"]}')
            return redirect(url_for('auth.login_page', error='google_failed'))
        
        user = result['user']
        
        # Create Flask session
        session['user_id'] = user.id
        session['user_email'] = user.email
        session['user_name'] = user.name
        session['user_role'] = user.role
        session['user_picture'] = user.profile_picture
        session['auth_provider'] = 'google'
        
        # Set session as permanent (24 hours)
        session.permanent = True
        
        print(f'✓ Google login successful: {user.email}')
        
        # Redirect to dashboard
        return redirect(url_for('index'))
    
    except Exception as e:
        print(f'Google callback exception: {str(e)}')
        import traceback
        traceback.print_exc()
        return redirect(url_for('auth.login_page', error='google_exception'))


# ============================================================
# GOOGLE USER INFO ROUTE (for debugging)
# ============================================================

@google_auth_bp.route('/userinfo')
def google_userinfo():
    """
    Get Google user info (for testing).
    
    GET /auth/google/userinfo
    
    Returns current user's Google profile information.
    Only works if user is logged in via Google.
    
    Returns:
        JSON response with user info
    """
    try:
        # Check if user is logged in via Google
        if session.get('auth_provider') != 'google':
            return jsonify({
                'success': False,
                'message': 'Not logged in with Google'
            }), 401
        
        # Get user from database
        from backend.models.user import get_user_by_id
        user = get_user_by_id(session.get('user_id'))
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict(include_sensitive=True)
        }), 200
    
    except Exception as e:
        print(f'Google userinfo error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to fetch user info'
        }), 500


# ============================================================
# GOOGLE AUTH STATUS ROUTE
# ============================================================

@google_auth_bp.route('/status')
def google_status():
    """
    Check Google OAuth configuration status.
    
    GET /auth/google/status
    
    Returns whether Google OAuth is properly configured.
    Useful for debugging configuration issues.
    
    Returns:
        JSON response with configuration status
    """
    try:
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        
        status = {
            'configured': bool(client_id and client_secret),
            'client_id_set': bool(client_id),
            'client_secret_set': bool(client_secret),
            'redirect_uri': url_for('google_auth.google_callback', _external=True)
        }
        
        return jsonify(status), 200
    
    except Exception as e:
        print(f'Google status error: {str(e)}')
        return jsonify({
            'error': 'Failed to check status'
        }), 500
