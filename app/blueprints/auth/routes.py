"""
Authentication Routes
Handles Google OAuth 2.0 login, callback, and logout
"""
from flask import redirect, request, url_for, session, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from app.blueprints.auth import auth_bp
from app.blueprints.auth.services import AuthService
from app.models.user import User


auth_service = AuthService()


@auth_bp.route('/login')
def login():
    """
    Initiate Google OAuth 2.0 login flow
    Redirects to Google's authorization endpoint
    """
    if current_user.is_authenticated:
        return redirect(url_for('auth.profile'))
    
    # Get Google OAuth authorization URL
    authorization_url = auth_service.get_google_auth_url()
    return redirect(authorization_url)


@auth_bp.route('/callback')
def callback():
    """
    Google OAuth 2.0 callback handler
    Receives authorization code and exchanges it for user information
    """
    # Get authorization code from callback
    code = request.args.get('code')
    
    if not code:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NO_AUTH_CODE',
                'message': 'Authorization code not provided'
            }
        }), 400
    
    try:
        # Exchange code for user info
        user_info = auth_service.get_user_info_from_code(code)
        
        # Create or update user in database
        user = auth_service.create_or_update_user(user_info)
        
        # Log the user in
        login_user(user, remember=True)
        
        # Update last login timestamp
        user.update_last_login()
        
        # Redirect to dashboard (will be implemented in Sprint 2)
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'AUTH_FAILED',
                'message': f'Authentication failed: {str(e)}'
            }
        }), 401


@auth_bp.route('/logout')
@login_required
def logout():
    """
    Logout current user and clear session
    """
    logout_user()
    session.clear()
    
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200


@auth_bp.route('/me')
@login_required
def profile():
    """
    Get current authenticated user information
    """
    return jsonify({
        'success': True,
        'data': current_user.to_dict()
    }), 200


@auth_bp.route('/status')
def status():
    """
    Check authentication status
    """
    if current_user.is_authenticated:
        return jsonify({
            'success': True,
            'authenticated': True,
            'user': current_user.to_dict()
        }), 200
    
    return jsonify({
        'success': True,
        'authenticated': False,
        'user': None
    }), 200
