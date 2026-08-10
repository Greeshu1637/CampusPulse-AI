"""
CampusPulse AI - Student Dining Routes
=======================================

API endpoints for student-facing Smart Dining features.

Routes:
- GET /api/dining/today - Today's menu
- GET /api/dining/week - Weekly menu
- GET /api/dining/search - Search menu
- POST /api/dining/rate - Rate food
- POST /api/dining/feedback - Submit feedback
- POST /api/dining/attendance - Mark attendance
- GET /api/dining/my-ratings - Student's ratings
- GET /api/dining/recommendations - AI recommendations
- POST /api/dining/ask - Ask AI a question

All routes require authentication (student role).
"""

from flask import Blueprint, jsonify, request, session
from backend.services.smart_dining_service import StudentDiningService, AIRecommendationService
from functools import wraps

# Create blueprint
student_dining_bp = Blueprint(
    'student_dining',
    __name__,
    url_prefix='/api/dining'
)


# ============================================================
# AUTHENTICATION DECORATOR
# ============================================================

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({
                'success': False,
                'message': 'Authentication required'
            }), 401
        return f(*args, **kwargs)
    return decorated_function


# ============================================================
# MENU ROUTES
# ============================================================

@student_dining_bp.route('/today', methods=['GET'])
def get_today_menu():
    """
    Get today's complete menu.
    
    GET /api/dining/today
    
    Returns:
        JSON: Today's menu with all meals, ratings, and status
    """
    try:
        result = StudentDiningService.get_today_menu()
        status_code = 200 if result['success'] else 404
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@student_dining_bp.route('/week', methods=['GET'])
def get_weekly_menu():
    """
    Get complete weekly menu.
    
    GET /api/dining/week
    
    Returns:
        JSON: Weekly menu organized by day
    """
    try:
        result = StudentDiningService.get_weekly_menu()
        status_code = 200 if result['success'] else 404
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@student_dining_bp.route('/search', methods=['GET'])
def search_menu():
    """
    Search menu items.
    
    GET /api/dining/search?q=query&is_veg=true&category=Main Course
    
    Query Parameters:
        q (str): Search query
        is_veg (bool): Filter vegetarian items
        category (str): Filter by category
        is_popular (bool): Filter popular items
    
    Returns:
        JSON: Search results
    """
    try:
        query = request.args.get('q', '')
        
        # Build filters
        filters = {}
        if request.args.get('is_veg'):
            filters['is_veg'] = request.args.get('is_veg').lower() == 'true'
        if request.args.get('category'):
            filters['category'] = request.args.get('category')
        if request.args.get('is_popular'):
            filters['is_popular'] = request.args.get('is_popular').lower() == 'true'
        
        result = StudentDiningService.search_menu(query, filters if filters else None)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# RATING & FEEDBACK ROUTES
# ============================================================

@student_dining_bp.route('/rate', methods=['POST'])
@require_auth
def rate_food():
    """
    Submit or update food rating.
    
    POST /api/dining/rate
    Body: {
        "item_id": 123,
        "rating": 4
    }
    
    Returns:
        JSON: Rating confirmation and stats
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'item_id' not in data or 'rating' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: item_id, rating'
            }), 400
        
        user_id = session.get('user_id')
        item_id = data['item_id']
        rating_value = data['rating']
        
        result = StudentDiningService.rate_food(user_id, item_id, rating_value)
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@student_dining_bp.route('/feedback', methods=['POST'])
@require_auth
def submit_feedback():
    """
    Submit food feedback.
    
    POST /api/dining/feedback
    Body: {
        "item_id": 123,
        "feedback_text": "Great taste!",
        "feedback_type": "praise",
        "is_anonymous": false
    }
    
    Returns:
        JSON: Feedback confirmation
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'item_id' not in data or 'feedback_text' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: item_id, feedback_text'
            }), 400
        
        user_id = session.get('user_id')
        item_id = data['item_id']
        feedback_text = data['feedback_text']
        feedback_type = data.get('feedback_type', 'general')
        is_anonymous = data.get('is_anonymous', False)
        
        result = StudentDiningService.submit_feedback(
            user_id,
            item_id,
            feedback_text,
            feedback_type,
            is_anonymous
        )
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# ATTENDANCE ROUTES
# ============================================================

@student_dining_bp.route('/attendance', methods=['POST'])
@require_auth
def mark_attendance():
    """
    Mark meal attendance.
    
    POST /api/dining/attendance
    Body: {
        "menu_id": 123,
        "attendance_date": "2026-07-29",
        "is_attending": true,
        "notes": "Optional notes"
    }
    
    Returns:
        JSON: Attendance confirmation
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'menu_id' not in data or 'attendance_date' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: menu_id, attendance_date'
            }), 400
        
        user_id = session.get('user_id')
        menu_id = data['menu_id']
        
        # Parse date
        from datetime import datetime
        attendance_date = datetime.strptime(data['attendance_date'], '%Y-%m-%d').date()
        
        is_attending = data.get('is_attending', True)
        notes = data.get('notes')
        
        result = StudentDiningService.mark_attendance(
            user_id,
            menu_id,
            attendance_date,
            is_attending,
            notes
        )
        status_code = 200 if result['success'] else 400
        return jsonify(result), status_code
    except ValueError:
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use YYYY-MM-DD'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@student_dining_bp.route('/my-ratings', methods=['GET'])
@require_auth
def get_my_ratings():
    """
    Get student's recent ratings.
    
    GET /api/dining/my-ratings?limit=10
    
    Query Parameters:
        limit (int): Number of ratings to fetch (default: 10)
    
    Returns:
        JSON: Student's ratings
    """
    try:
        user_id = session.get('user_id')
        limit = int(request.args.get('limit', 10))
        
        result = StudentDiningService.get_my_ratings(user_id, limit)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# AI ROUTES
# ============================================================

@student_dining_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """
    Get AI-powered recommendations.
    
    GET /api/dining/recommendations
    
    Returns:
        JSON: Personalized recommendations
    """
    try:
        user_id = session.get('user_id')  # Optional
        result = AIRecommendationService.get_recommendations(user_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


@student_dining_bp.route('/ask', methods=['POST'])
def ask_ai():
    """
    Ask AI a question about the menu.
    
    POST /api/dining/ask
    Body: {
        "question": "What's today's breakfast?"
    }
    
    Returns:
        JSON: AI answer with relevant data
    """
    try:
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required field: question'
            }), 400
        
        question = data['question']
        result = AIRecommendationService.answer_question(question)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# HEALTH CHECK
# ============================================================

@student_dining_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'service': 'Student Dining API',
        'status': 'operational'
    }), 200
