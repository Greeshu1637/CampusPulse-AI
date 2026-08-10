"""
CampusPulse AI - Mess Routes
=============================

REST API endpoints for mess management system.
"""

from flask import Blueprint, jsonify, request, session
from backend.services.mess_service import MessService


# ============================================================
# CREATE MESS BLUEPRINT
# ============================================================
mess_bp = Blueprint(
    'mess',
    __name__,
    url_prefix='/api/mess'
)


# ============================================================
# HELPER FUNCTION: LOGIN CHECK
# ============================================================

def require_auth():
    """Check if user is authenticated"""
    if not session.get('user_id'):
        return False, jsonify({
            'success': False,
            'message': 'Authentication required'
        }), 401
    return True, None


# ============================================================
# MESS API ROUTES
# ============================================================

@mess_bp.route('/today', methods=['GET'])
def get_today_menu():
    """
    Get today's mess menu
    
    GET /api/mess/today
    
    Returns:
        JSON response with today's complete menu
    """
    try:
        menu = MessService.get_today_menu()
        
        if not menu:
            return jsonify({
                'success': False,
                'message': 'No menu available for today'
            }), 404
        
        return jsonify({
            'success': True,
            'menu': menu
        }), 200
    
    except Exception as e:
        print(f'Error fetching today\'s menu: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Failed to fetch today\'s menu'
        }), 500


@mess_bp.route('/week', methods=['GET'])
def get_week_menu():
    """
    Get complete weekly mess menu
    
    GET /api/mess/week
    
    Returns:
        JSON response with entire week's menu
    """
    try:
        menus = MessService.get_week_menu()
        
        return jsonify({
            'success': True,
            'menus': menus
        }), 200
    
    except Exception as e:
        print(f'Error fetching weekly menu: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Failed to fetch weekly menu'
        }), 500


@mess_bp.route('/day/<day>', methods=['GET'])
def get_day_menu(day):
    """
    Get menu for a specific day
    
    GET /api/mess/day/<day>
    
    Args:
        day: Day of week (Monday, Tuesday, etc.)
    
    Returns:
        JSON response with day's menu
    """
    try:
        # Capitalize first letter
        day = day.capitalize()
        
        # Validate day
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if day not in valid_days:
            return jsonify({
                'success': False,
                'message': 'Invalid day. Use: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'
            }), 400
        
        menu = MessService.get_day_menu(day)
        
        if not menu:
            return jsonify({
                'success': False,
                'message': f'No menu available for {day}'
            }), 404
        
        return jsonify({
            'success': True,
            'menu': menu
        }), 200
    
    except Exception as e:
        print(f'Error fetching menu for {day}: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Failed to fetch menu for {day}'
        }), 500


@mess_bp.route('/rating', methods=['POST'])
def submit_rating():
    """
    Submit or update a food rating
    
    POST /api/mess/rating
    
    Expected JSON payload:
    {
        "menu_item_id": 1,
        "rating": 5,
        "feedback": "Delicious!" (optional)
    }
    
    Returns:
        JSON response with rating status
    """
    try:
        # Check authentication
        is_auth, error_response = require_auth()
        if not is_auth:
            return error_response
        
        user_id = session.get('user_id')
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        menu_item_id = data.get('menu_item_id')
        rating = data.get('rating')
        feedback = data.get('feedback')
        
        # Validate required fields
        if not menu_item_id:
            return jsonify({
                'success': False,
                'message': 'menu_item_id is required'
            }), 400
        
        if not rating:
            return jsonify({
                'success': False,
                'message': 'rating is required'
            }), 400
        
        # Validate rating value
        try:
            rating = int(rating)
            if not (1 <= rating <= 5):
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'message': 'rating must be an integer between 1 and 5'
            }), 400
        
        # Submit rating
        try:
            rating_obj = MessService.submit_rating(user_id, menu_item_id, rating, feedback)
        except ValueError as ve:
            return jsonify({
                'success': False,
                'message': str(ve)
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Rating submitted successfully',
            'rating': rating_obj.to_dict()
        }), 200
    
    except Exception as e:
        print(f'Error submitting rating: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Failed to submit rating'
        }), 500


@mess_bp.route('/rating/<int:menu_item_id>', methods=['GET'])
def get_item_ratings(menu_item_id):
    """
    Get all ratings for a menu item
    
    GET /api/mess/rating/<menu_item_id>
    
    Returns:
        JSON response with item ratings
    """
    try:
        ratings_data = MessService.get_item_ratings(menu_item_id)
        
        if not ratings_data:
            return jsonify({
                'success': False,
                'message': 'Menu item not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': ratings_data
        }), 200
    
    except Exception as e:
        print(f'Error fetching ratings: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Failed to fetch ratings'
        }), 500
