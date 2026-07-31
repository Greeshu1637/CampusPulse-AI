"""
Authorization Decorators
Role-based access control decorators for routes
"""
from functools import wraps
from flask import jsonify
from flask_login import current_user


def role_required(*roles):
    """
    Decorator to restrict access to specific roles
    
    Usage:
        @role_required('admin', 'hostel_manager')
        def some_route():
            pass
    
    Args:
        *roles: Variable number of role strings
    
    Returns:
        Decorator function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'UNAUTHORIZED',
                        'message': 'Authentication required'
                    }
                }), 401
            
            if not current_user.has_role(*roles):
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'FORBIDDEN',
                        'message': f'Access denied. Required roles: {", ".join(roles)}'
                    }
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def admin_required(f):
    """
    Decorator to restrict access to admin only
    Shorthand for @role_required('admin')
    """
    return role_required('admin')(f)


def student_required(f):
    """
    Decorator to restrict access to students only
    """
    return role_required('student')(f)


def mess_manager_required(f):
    """
    Decorator to restrict access to mess managers only
    """
    return role_required('mess_manager')(f)


def hostel_manager_required(f):
    """
    Decorator to restrict access to hostel managers only
    """
    return role_required('hostel_manager')(f)
