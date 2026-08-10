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
from backend.services.auth_service import AuthService
from backend.models.user import get_user_by_email, get_user_by_id
from backend.database import db
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


@auth_bp.route('/register', methods=['GET'])
def register_page():
    """
    Render the registration page.
    
    GET /auth/register
    
    Returns:
        Rendered register.html template
    """
    # Check if user is already logged in
    if session.get('user_id'):
        return redirect(url_for('index'))
    
    return render_template('register.html')


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Handle user registration.
    
    POST /auth/register
    
    Expected JSON payload:
    {
        "name": "Full Name",
        "email": "user@example.com",
        "password": "SecurePass123",
        "confirm_password": "SecurePass123",
        "role": "student"
    }
    
    Returns:
        JSON response with registration status
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
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        role = data.get('role', 'student')
        
        # Validate name
        if not name:
            return jsonify({
                'success': False,
                'message': 'Full name is required',
                'field': 'name'
            }), 400
        
        if len(name) < 2:
            return jsonify({
                'success': False,
                'message': 'Name must be at least 2 characters',
                'field': 'name'
            }), 400
        
        # Validate email
        if not email:
            return jsonify({
                'success': False,
                'message': 'Email is required',
                'field': 'email'
            }), 400
        
        # Email format validation
        import re
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({
                'success': False,
                'message': 'Invalid email format',
                'field': 'email'
            }), 400
        
        # Check if email already exists
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Email already registered',
                'field': 'email'
            }), 409
        
        # Validate password
        if not password:
            return jsonify({
                'success': False,
                'message': 'Password is required',
                'field': 'password'
            }), 400
        
        # Password strength validation
        if len(password) < 8:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 8 characters',
                'field': 'password'
            }), 400
        
        # Check password complexity
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        
        if not has_upper:
            return jsonify({
                'success': False,
                'message': 'Password must contain at least one uppercase letter',
                'field': 'password'
            }), 400
        
        if not has_lower:
            return jsonify({
                'success': False,
                'message': 'Password must contain at least one lowercase letter',
                'field': 'password'
            }), 400
        
        if not has_digit:
            return jsonify({
                'success': False,
                'message': 'Password must contain at least one number',
                'field': 'password'
            }), 400
        
        # Validate confirm password
        if not confirm_password:
            return jsonify({
                'success': False,
                'message': 'Please confirm your password',
                'field': 'confirm_password'
            }), 400
        
        if password != confirm_password:
            return jsonify({
                'success': False,
                'message': 'Passwords do not match',
                'field': 'confirm_password'
            }), 400
        
        # Validate role
        valid_roles = ['student', 'admin', 'maintenance', 'mess']
        if role not in valid_roles:
            return jsonify({
                'success': False,
                'message': 'Invalid role selected',
                'field': 'role'
            }), 400
        
        # Create new user
        from backend.models.user import User
        new_user = User(
            name=name,
            email=email,
            role=role,
            auth_provider='email',
            is_active=True,
            is_verified=False  # Email verification can be added later
        )
        
        # Hash and set password
        new_user.set_password(password)
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        print(f'✓ New user registered: {email} ({role})')
        
        # Auto-login after registration
        session['user_id'] = new_user.id
        session['user_email'] = new_user.email
        session['user_role'] = new_user.role
        session['user_name'] = new_user.name
        session['user_picture'] = new_user.profile_picture
        session['auth_provider'] = 'email'
        session.permanent = True
        
        # Update last login
        new_user.update_last_login()
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': new_user.to_dict(include_sensitive=False),
            'redirect': '/frontend/pages/dashboard.html'
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f'Registration error: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'An error occurred during registration'
        }), 500


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
        
        # Authenticate user with database
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        # Verify password (only for email auth users)
        if user.auth_provider == 'email':
            if not user.check_password(password):
                return jsonify({
                    'success': False,
                    'message': 'Invalid email or password'
                }), 401
        else:
            # OAuth users cannot login with password
            return jsonify({
                'success': False,
                'message': f'This account uses {user.auth_provider} authentication. Please use the "Continue with {user.auth_provider.title()}" button.'
            }), 401
        
        # Verify role if specified
        if role and user.role != role:
            return jsonify({
                'success': False,
                'message': f'Access denied for role: {role}'
            }), 403
        
        # Check if user is active
        if not user.is_active:
            return jsonify({
                'success': False,
                'message': 'Account is disabled. Contact administrator.'
            }), 403
        
        # Update last login
        user.update_last_login()
        
        # Create session
        session['user_id'] = user.id
        session['user_email'] = user.email
        session['user_role'] = user.role
        session['user_name'] = user.name
        session['user_picture'] = user.profile_picture
        session['auth_provider'] = 'email'
        
        # Set session as permanent if "remember me" is checked
        session.permanent = remember
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(include_sensitive=False),
            'redirect': '/frontend/pages/dashboard.html'
        }), 200
    
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
                'role': session.get('user_role'),
                'picture': session.get('user_picture'),
                'auth_provider': session.get('auth_provider', 'email')
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
