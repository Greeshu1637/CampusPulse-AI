"""
CampusPulse AI - Mess Manager Routes
=====================================

API endpoints for mess manager operations.

Routes:
- POST /api/manager/menu - Create menu
- PUT /api/manager/menu/<id> - Update menu
- DELETE /api/manager/menu/<id> - Delete menu
- GET /api/manager/menus - Get all menus
- GET /api/manager/menu/<id> - Get menu by ID
- GET /api/manager/ratings - Get all ratings
- GET /api/manager/feedback - Get all feedback
- POST /api/manager/feedback/<id>/respond - Respond to feedback
- GET /api/manager/dashboard - Dashboard stats
- GET /api/manager/reports/attendance - Attendance report

All routes require authentication (mess_manager role).
"""

from flask import Blueprint, jsonify, request, session
from backend.services.mess_manager_service import MessManagerService
from functools import wraps
from datetime import datetime

# Create blueprint
mess_manager_bp = Blueprint(
    'mess_manager',
    __name__,
    url_prefix='/api/manager'
)


# ============================================================
# AUTHENTICATION & AUTHORIZATION
# ============================================================

def require_manager(f):
    """Decorator to require mess manager authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({
                'success': False,
                'message': 'Authentication required'
            }), 401
        
        # TODO: Check if user has mess_manager role
        # For now, just check if authenticated
        
        return f(*args, **kwargs)
    return decorated_function


# ============================================================
# MENU CRUD ROUTES
# ============================================================

@mess_manager_bp.route('/menu', methods=['POST'])
@require_manager
def create_menu():
    """
    Create a new menu.
    
    POST /api/manager/menu
    Body: {
        "day": "Monday",
        "meal_type": "Breakfast",
        "menu_date": "2026-07-29",
        "time_start": "07:00",
        "time_end": "09:00",
        "is_special": false,
        "description": "",
        "estimated_servings": 3000,
        "items": [...]
    }
    
    Returns:
        JSON: Created menu
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        manager_id = session.get('user_id')
        result = MessManagerService.create_menu(manager_id, data)
        
        status_code = 201 if result['success'] else 400
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mess_manager_bp.route('/menu/<int:menu_id>', methods=['PUT'])
@require_manager
def update_menu(menu_id):
    """
    Update an existing menu.
    
    PUT /api/manager/menu/<menu_id>
    Body: {
        "time_start": "07:00",
        "time_end": "09:00",
        "is_special": true,
        "items": [...]
    }
    
    Returns:
        JSON: Updated menu
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        result = MessManagerService.update_menu(menu_id, data)
        
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mess_manager_bp.route('/menu/<int:menu_id>', methods=['DELETE'])
@require_manager
def delete_menu(menu_id):
    """
    Delete a menu.
    
    DELETE /api/manager/menu/<menu_id>
    
    Returns:
        JSON: Success status
    """
    try:
        result = MessManagerService.delete_menu(menu_id)
        
        status_code = 200 if result['success'] else 404
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mess_manager_bp.route('/menus', methods=['GET'])
@require_manager
def get_all_menus():
    """
    Get all menus with optional filters.
    
    GET /api/manager/menus?day=Monday&meal_type=Breakfast&is_published=true
    
    Query Parameters:
        day (str): Filter by day
        meal_type (str): Filter by meal type
        is_published (bool): Filter by published status
        is_special (bool): Filter by special status
    
    Returns:
        JSON: List of menus
    """
    try:
        # Build filters
        filters = {}
        if request.args.get('day'):
            filters['day'] = request.args.get('day')
        if request.args.get('meal_type'):
            filters['meal_type'] = request.args.get('meal_type')
        if request.args.get('is_published'):
            filters['is_published'] = request.args.get('is_published').lower() == 'true'
        if request.args.get('is_special'):
            filters['is_special'] = request.args.get('is_special').lower() == 'true'
        
        result = MessManagerService.get_all_menus(filters if filters else None)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mess_manager_bp.route('/menu/<int:menu_id>', methods=['GET'])
@require_manager
def get_menu_by_id(menu_id):
    """
    Get menu details by ID.
    
    GET /api/manager/menu/<menu_id>
    
    Returns:
        JSON: Menu details
    """
    try:
        result = MessManagerService.get_menu_by_id(menu_id)
        
        status_code = 200 if result['success'] else 404
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# RATINGS & FEEDBACK ROUTES
# ============================================================

@mess_manager_bp.route('/ratings', methods=['GET'])
@require_manager
def get_all_ratings():
    """
    Get all ratings with optional filters.
    
    GET /api/manager/ratings?menu_id=123&min_rating=3&limit=50
    
    Query Parameters:
        menu_id (int): Filter by menu ID
        item_id (int): Filter by item ID
        min_rating (int): Minimum rating
        max_rating (int): Maximum rating
        limit (int): Maximum results (default: 50)
    
    Returns:
        JSON: List of ratings
    """
    try:
        # Build filters
        filters = {}
        if request.args.get('menu_id'):
            filters['menu_id'] = int(request.args.get('menu_id'))
        if request.args.get('item_id'):
            filters['item_id'] = int(request.args.get('item_id'))
        if request.args.get('min_rating'):
            filters['min_rating'] = int(request.args.get('min_rating'))
        if request.args.get('max_rating'):
            filters['max_rating'] = int(request.args.get('max_rating'))
        
        limit = int(request.args.get('limit', 50))
        
        result = MessManagerService.get_all_ratings(filters if filters else None, limit)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mess_manager_bp.route('/feedback', methods=['GET'])
@require_manager
def get_all_feedback():
    """
    Get all feedback with optional filters.
    
    GET /api/manager/feedback?menu_id=123&is_reviewed=false&limit=50
    
    Query Parameters:
        menu_id (int): Filter by menu ID
        item_id (int): Filter by item ID
        feedback_type (str): Filter by type
        is_reviewed (bool): Filter by reviewed status
        limit (int): Maximum results (default: 50)
    
    Returns:
        JSON: List of feedback
    """
    try:
        # Build filters
        filters = {}
        if request.args.get('menu_id'):
            filters['menu_id'] = int(request.args.get('menu_id'))
        if request.args.get('item_id'):
            filters['item_id'] = int(request.args.get('item_id'))
        if request.args.get('feedback_type'):
            filters['feedback_type'] = request.args.get('feedback_type')
        if request.args.get('is_reviewed'):
            filters['is_reviewed'] = request.args.get('is_reviewed').lower() == 'true'
        
        limit = int(request.args.get('limit', 50))
        
        result = MessManagerService.get_all_feedback(filters if filters else None, limit)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mess_manager_bp.route('/feedback/<int:feedback_id>/respond', methods=['POST'])
@require_manager
def respond_to_feedback(feedback_id):
    """
    Respond to student feedback.
    
    POST /api/manager/feedback/<feedback_id>/respond
    Body: {
        "response": "Thank you for your feedback..."
    }
    
    Returns:
        JSON: Updated feedback
    """
    try:
        data = request.get_json()
        
        if not data or 'response' not in data:
            return jsonify({
                'success': False,
                'message': 'Response text is required'
            }), 400
        
        manager_id = session.get('user_id')
        result = MessManagerService.respond_to_feedback(
            feedback_id,
            manager_id,
            data['response']
        )
        
        status_code = 200 if result['success'] else 404
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# DASHBOARD & ANALYTICS ROUTES
# ============================================================

@mess_manager_bp.route('/dashboard', methods=['GET'])
@require_manager
def get_dashboard_stats():
    """
    Get dashboard KPIs and statistics.
    
    GET /api/manager/dashboard
    
    Returns:
        JSON: Dashboard statistics
    """
    try:
        result = MessManagerService.get_dashboard_stats()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@mess_manager_bp.route('/reports/attendance', methods=['GET'])
@require_manager
def get_attendance_report():
    """
    Generate attendance report for date range.
    
    GET /api/manager/reports/attendance?start_date=2026-07-01&end_date=2026-07-31
    
    Query Parameters:
        start_date (str): Start date (YYYY-MM-DD)
        end_date (str): End date (YYYY-MM-DD)
    
    Returns:
        JSON: Attendance report
    """
    try:
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        if not start_date_str or not end_date_str:
            return jsonify({
                'success': False,
                'message': 'start_date and end_date are required'
            }), 400
        
        # Parse dates
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid date format. Use YYYY-MM-DD'
            }), 400
        
        result = MessManagerService.generate_attendance_report(start_date, end_date)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# HEALTH CHECK
# ============================================================

@mess_manager_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'service': 'Mess Manager API',
        'status': 'operational'
    }), 200
