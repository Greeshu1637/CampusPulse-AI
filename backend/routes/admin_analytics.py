"""
CampusPulse AI - Admin Analytics Routes
========================================

API endpoints for admin-level analytics and reporting.

Routes:
- GET /api/admin/dashboard - Admin dashboard overview
- GET /api/admin/attendance - Attendance report
- GET /api/admin/ratings - Rating report
- GET /api/admin/popularity - Food popularity report
- GET /api/admin/nutrition - Nutritional analysis
- GET /api/admin/feedback - Feedback analysis
- GET /api/admin/export - Export comprehensive report

All routes require authentication (admin role).
"""

from flask import Blueprint, jsonify, request, session
from backend.services.admin_analytics_service import AdminAnalyticsService
from functools import wraps
from datetime import datetime, date, timedelta

# Create blueprint
admin_analytics_bp = Blueprint(
    'admin_analytics',
    __name__,
    url_prefix='/api/admin'
)


# ============================================================
# AUTHENTICATION & AUTHORIZATION
# ============================================================

def require_admin(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({
                'success': False,
                'message': 'Authentication required'
            }), 401
        
        # TODO: Check if user has admin role
        # For now, just check if authenticated
        
        return f(*args, **kwargs)
    return decorated_function


# ============================================================
# DASHBOARD ROUTE
# ============================================================

@admin_analytics_bp.route('/dashboard', methods=['GET'])
@require_admin
def get_admin_dashboard():
    """
    Get comprehensive admin dashboard.
    
    GET /api/admin/dashboard
    
    Returns:
        JSON: Complete dashboard with all key metrics
    """
    try:
        result = AdminAnalyticsService.get_admin_dashboard()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# ATTENDANCE ROUTES
# ============================================================

@admin_analytics_bp.route('/attendance', methods=['GET'])
@require_admin
def get_attendance_report():
    """
    Get attendance report for date range.
    
    GET /api/admin/attendance?start_date=2026-07-01&end_date=2026-07-31
    
    Query Parameters:
        start_date (str): Start date (YYYY-MM-DD, default: 7 days ago)
        end_date (str): End date (YYYY-MM-DD, default: today)
        group_by (str): 'day', 'week', or 'month' (default: 'day')
    
    Returns:
        JSON: Attendance report
    """
    try:
        # Parse dates
        end_date = date.today()
        start_date = end_date - timedelta(days=7)
        
        if request.args.get('start_date'):
            try:
                start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid start_date format. Use YYYY-MM-DD'
                }), 400
        
        if request.args.get('end_date'):
            try:
                end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid end_date format. Use YYYY-MM-DD'
                }), 400
        
        group_by = request.args.get('group_by', 'day')
        
        result = AdminAnalyticsService.get_attendance_report(start_date, end_date, group_by)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# RATING ROUTES
# ============================================================

@admin_analytics_bp.route('/ratings', methods=['GET'])
@require_admin
def get_rating_report():
    """
    Get rating report.
    
    GET /api/admin/ratings?start_date=2026-07-01&end_date=2026-07-31
    
    Query Parameters:
        start_date (str): Start date (YYYY-MM-DD, optional)
        end_date (str): End date (YYYY-MM-DD, optional)
    
    Returns:
        JSON: Rating report
    """
    try:
        start_date = None
        end_date = None
        
        if request.args.get('start_date'):
            try:
                start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid start_date format. Use YYYY-MM-DD'
                }), 400
        
        if request.args.get('end_date'):
            try:
                end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid end_date format. Use YYYY-MM-DD'
                }), 400
        
        result = AdminAnalyticsService.get_rating_report(start_date, end_date)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# FOOD POPULARITY ROUTES
# ============================================================

@admin_analytics_bp.route('/popularity', methods=['GET'])
@require_admin
def get_food_popularity():
    """
    Get food popularity report.
    
    GET /api/admin/popularity
    
    Returns:
        JSON: Food popularity report
    """
    try:
        result = AdminAnalyticsService.get_food_popularity_report()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# NUTRITIONAL ROUTES
# ============================================================

@admin_analytics_bp.route('/nutrition', methods=['GET'])
@require_admin
def get_nutritional_report():
    """
    Get nutritional analysis report.
    
    GET /api/admin/nutrition
    
    Returns:
        JSON: Nutritional report
    """
    try:
        result = AdminAnalyticsService.get_nutritional_report()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# FEEDBACK ROUTES
# ============================================================

@admin_analytics_bp.route('/feedback', methods=['GET'])
@require_admin
def get_feedback_analysis():
    """
    Get feedback analysis.
    
    GET /api/admin/feedback?start_date=2026-07-01&end_date=2026-07-31
    
    Query Parameters:
        start_date (str): Start date (YYYY-MM-DD, optional)
        end_date (str): End date (YYYY-MM-DD, optional)
    
    Returns:
        JSON: Feedback analysis
    """
    try:
        start_date = None
        end_date = None
        
        if request.args.get('start_date'):
            try:
                start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid start_date format. Use YYYY-MM-DD'
                }), 400
        
        if request.args.get('end_date'):
            try:
                end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Invalid end_date format. Use YYYY-MM-DD'
                }), 400
        
        result = AdminAnalyticsService.get_feedback_analysis(start_date, end_date)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# EXPORT ROUTES
# ============================================================

@admin_analytics_bp.route('/export', methods=['GET'])
@require_admin
def export_comprehensive_report():
    """
    Export comprehensive report with all analytics.
    
    GET /api/admin/export?format=json&start_date=2026-07-01&end_date=2026-07-31
    
    Query Parameters:
        format (str): 'json', 'csv', or 'pdf' (default: 'json')
        start_date (str): Start date (YYYY-MM-DD, optional)
        end_date (str): End date (YYYY-MM-DD, optional)
    
    Returns:
        JSON/CSV/PDF: Comprehensive report
    """
    try:
        format_type = request.args.get('format', 'json')
        
        # Parse dates
        start_date = None
        end_date = None
        
        if request.args.get('start_date'):
            start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
        if request.args.get('end_date'):
            end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
        
        # Gather all reports
        dashboard = AdminAnalyticsService.get_admin_dashboard()
        attendance = AdminAnalyticsService.get_attendance_report(
            start_date or (date.today() - timedelta(days=30)),
            end_date or date.today()
        )
        ratings = AdminAnalyticsService.get_rating_report(start_date, end_date)
        popularity = AdminAnalyticsService.get_food_popularity_report()
        nutrition = AdminAnalyticsService.get_nutritional_report()
        feedback = AdminAnalyticsService.get_feedback_analysis(start_date, end_date)
        
        comprehensive_report = {
            'success': True,
            'generated_at': datetime.utcnow().isoformat(),
            'report_period': {
                'start_date': str(start_date) if start_date else 'all',
                'end_date': str(end_date) if end_date else 'all'
            },
            'dashboard': dashboard.get('dashboard'),
            'attendance': attendance,
            'ratings': ratings,
            'popularity': popularity,
            'nutrition': nutrition,
            'feedback': feedback
        }
        
        if format_type == 'json':
            return jsonify(comprehensive_report), 200
        elif format_type == 'csv':
            # TODO: Implement CSV export
            return jsonify({
                'success': False,
                'message': 'CSV export not yet implemented'
            }), 501
        elif format_type == 'pdf':
            # TODO: Implement PDF export
            return jsonify({
                'success': False,
                'message': 'PDF export not yet implemented'
            }), 501
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid format. Use json, csv, or pdf'
            }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500


# ============================================================
# HEALTH CHECK
# ============================================================

@admin_analytics_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'service': 'Admin Analytics API',
        'status': 'operational'
    }), 200
