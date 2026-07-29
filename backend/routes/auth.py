"""
CampusPulse AI - Authentication Routes
=======================================

This module handles all authentication-related routes:
- User login
- User logout
- Session management
- Password reset (future)
- User registration (future)

All routes in this blueprint are prefixed with /auth
Example: /auth/login, /auth/logout

Security Features:
- Session-based authentication
- Password hashing (when database is implemented)
- CSRF protection
- Rate limiting (to be added)
"""

from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
from services.auth_service import AuthService

# ============================================================
# CREATE AUTHENTICATION BLUEPRINT
# ============================================================
auth_bp = Blueprint(
    'auth',                    # Blueprint name
    __name__,                  # Blueprint import name
    url_prefix='/auth'         # URL prefix for all routes in this blueprint
)

# Initialize authentication service
auth_service = AuthService()


# ============================================================
# LOGIN ROUTES
# ============================================================

@auth_bp.route('/login', methods=['GET'])
def login_page():
    """
    Render the login page.
    
    GET /auth/login
    
    Returns:
        Rendered login.html template
    """
    # Check if user is already logged in
    if session.get('user_id'):
        return redirect(url_for('index'))
    
    return render_template('login.html')


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Handle login form submission.
    
    POST /auth/login
    
    Expected JSON payload:
    {
        "email": "user@example.com",
        "password": "password123",
        "role": "student",  # or "admin", "maintenance", "mess"
        "remember": true
    }
    
    Returns:
        JSON response with login status and user data
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')
        remember = data.get('remember', False)
        
        # Validate input
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        # TODO: Authenticate user with database
        # For now, use mock authentication
        auth_result = auth_service.authenticate_user(email, password, role)
        
        if auth_result['success']:
            # Store user info in session
            session['user_id'] = auth_result['user']['id']
            session['user_email'] = auth_result['user']['email']
            session['user_role'] = auth_result['user']['role']
            session['user_name'] = auth_result['user']['name']
            
            # Set session as permanent if "remember me" is checked
            session.permanent = remember
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': auth_result['user'],
                'redirect': url_for('index')
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': auth_result['message']
            }), 401
    
    except Exception as e:
        print(f'Login error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500


# ============================================================
# LOGOUT ROUTE
# ============================================================

@auth_bp.route('/logout', methods=['POST', 'GET'])
def logout():
    """
    Handle user logout.
    
    POST /auth/logout or GET /auth/logout
    
    Clears the user session and redirects to login page.
    
    Returns:
        JSON response or redirect to login page
    """
    try:
        # Clear all session data
        user_name = session.get('user_name', 'User')
        session.clear()
        
        # Return JSON for API calls
        if request.is_json or request.method == 'POST':
            return jsonify({
                'success': True,
                'message': f'Goodbye, {user_name}!',
                'redirect': url_for('auth.login_page')
            }), 200
        
        # Redirect for browser requests
        return redirect(url_for('auth.login_page'))
    
    except Exception as e:
        print(f'Logout error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'An error occurred during logout'
        }), 500


# ============================================================
# SESSION CHECK ROUTE
# ============================================================

@auth_bp.route('/check-session', methods=['GET'])
def check_session():
    """
    Check if user session is valid.
    
    GET /auth/check-session
    
    Useful for frontend to verify authentication status.
    
    Returns:
        JSON response with session validity and user data
    """
    if session.get('user_id'):
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session.get('user_id'),
                'email': session.get('user_email'),
                'name': session.get('user_name'),
                'role': session.get('user_role')
            }
        }), 200
    else:
        return jsonify({
            'authenticated': False
        }), 200


# ============================================================
# PASSWORD RESET ROUTES (PLACEHOLDER)
# ============================================================

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Handle forgot password request.
    
    POST /auth/forgot-password
    
    Expected JSON payload:
    {
        "email": "user@example.com"
    }
    
    TODO: Implement email-based password reset
    
    Returns:
        JSON response indicating reset email sent
    """
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'message': 'Email is required'
            }), 400
        
        # TODO: Generate reset token and send email
        # TODO: Store reset token in database with expiration
        
        return jsonify({
            'success': True,
            'message': 'Password reset instructions sent to your email'
        }), 200
    
    except Exception as e:
        print(f'Forgot password error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Handle password reset with token.
    
    POST /auth/reset-password
    
    Expected JSON payload:
    {
        "token": "reset-token-here",
        "new_password": "newpassword123"
    }
    
    TODO: Implement password reset with token validation
    
    Returns:
        JSON response indicating password reset status
    """
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token or not new_password:
            return jsonify({
                'success': False,
                'message': 'Token and new password are required'
            }), 400
        
        # TODO: Validate token
        # TODO: Update user password in database
        # TODO: Invalidate token
        
        return jsonify({
            'success': True,
            'message': 'Password reset successful'
        }), 200
    
    except Exception as e:
        print(f'Reset password error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


# ============================================================
# HELPER FUNCTION: LOGIN REQUIRED DECORATOR
# ============================================================

def login_required(f):
    """
    Decorator to protect routes that require authentication.
    
    Usage:
        @auth_bp.route('/protected')
        @login_required
        def protected_route():
            return 'This is protected'
    
    Args:
        f: Function to wrap
    
    Returns:
        Wrapped function that checks for valid session
    """
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            if request.is_json:
                return jsonify({
                    'success': False,
                    'message': 'Authentication required'
                }), 401
            return redirect(url_for('auth.login_page'))
        return f(*args, **kwargs)
    
    return decorated_function
