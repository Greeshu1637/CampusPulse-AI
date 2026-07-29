"""
CampusPulse AI - Dashboard Routes
==================================

This module handles all dashboard and analytics API routes:
- Dashboard data
- KPI metrics
- Analytics data
- Statistics
- Reports

All routes in this blueprint are prefixed with /api
Example: /api/dashboard, /api/kpis, /api/analytics

These routes return JSON data consumed by the frontend.
"""

from flask import Blueprint, jsonify, request, session
from datetime import datetime, timedelta
import random

# ============================================================
# CREATE DASHBOARD BLUEPRINT
# ============================================================
dashboard_bp = Blueprint(
    'dashboard',               # Blueprint name
    __name__,                  # Blueprint import name
    url_prefix='/api'          # URL prefix for all routes
)


# ============================================================
# HELPER FUNCTION: LOGIN CHECK
# ============================================================

def require_auth():
    """
    Check if user is authenticated.
    
    Returns:
        tuple: (is_authenticated, error_response)
    """
    if not session.get('user_id'):
        return False, jsonify({
            'success': False,
            'message': 'Authentication required'
        }), 401
    return True, None


# ============================================================
# DASHBOARD DATA ROUTES
# ============================================================

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    """
    Get main dashboard data.
    
    GET /api/dashboard
    
    Returns all data needed for the main dashboard:
    - KPI metrics
    - Recent activities
    - Alerts
    - Quick stats
    
    Returns:
        JSON response with dashboard data
    """
    try:
        # TODO: Replace with actual database queries
        # This is mock data for demonstration
        
        dashboard_data = {
            'success': True,
            'timestamp': datetime.utcnow().isoformat(),
            'user': {
                'name': session.get('user_name', 'Admin'),
                'role': session.get('user_role', 'admin')
            },
            'kpis': {
                'total_students': 12847,
                'attendance_rate': 94.2,
                'open_complaints': 47,
                'room_utilization': 78,
                'food_rating': 4.6,
                'campus_health_score': 85
            },
            'recent_activities': [
                {
                    'id': 1,
                    'type': 'complaint_resolved',
                    'title': 'Wi-Fi Issue Resolved',
                    'description': 'Block C Wi-Fi connectivity restored',
                    'timestamp': (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
                    'icon': 'fa-check-circle',
                    'color': 'green'
                },
                {
                    'id': 2,
                    'type': 'new_complaint',
                    'title': 'New Complaint Filed',
                    'description': 'Water leakage reported in Hostel A',
                    'timestamp': (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                    'icon': 'fa-triangle-exclamation',
                    'color': 'red'
                },
                {
                    'id': 3,
                    'type': 'ai_recommendation',
                    'title': 'AI Recommendation',
                    'description': 'Menu optimization suggestion generated',
                    'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                    'icon': 'fa-wand-magic-sparkles',
                    'color': 'purple'
                }
            ],
            'alerts': [
                {
                    'id': 1,
                    'severity': 'high',
                    'title': 'Peak Power Alert',
                    'message': 'Predicted 23% surge in Block C, Friday 2-5 PM',
                    'action': 'Schedule load balancing'
                },
                {
                    'id': 2,
                    'severity': 'medium',
                    'title': 'Library Congestion',
                    'message': 'Exam season starts in 5 days. Consider extending hours',
                    'action': 'Review schedule'
                }
            ]
        }
        
        return jsonify(dashboard_data), 200
    
    except Exception as e:
        print(f'Dashboard error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load dashboard data'
        }), 500


# ============================================================
# KPI ROUTES
# ============================================================

@dashboard_bp.route('/kpis', methods=['GET'])
def get_kpis():
    """
    Get KPI (Key Performance Indicator) metrics.
    
    GET /api/kpis?timeframe=week
    
    Query parameters:
    - timeframe: 'today', 'week', 'month', 'year' (default: 'week')
    
    Returns:
        JSON response with KPI data
    """
    try:
        timeframe = request.args.get('timeframe', 'week')
        
        # TODO: Fetch real data from database based on timeframe
        kpis = {
            'success': True,
            'timeframe': timeframe,
            'data': {
                'students': {
                    'total': 12847,
                    'active': 12103,
                    'change': 5.2,
                    'trend': 'up'
                },
                'attendance': {
                    'average': 94.2,
                    'change': 2.8,
                    'trend': 'up',
                    'by_department': {
                        'CSE': 96.8,
                        'ECE': 94.1,
                        'MECH': 92.5,
                        'CIVIL': 91.8
                    }
                },
                'complaints': {
                    'total': 342,
                    'open': 47,
                    'in_progress': 19,
                    'resolved': 295,
                    'resolution_rate': 86.2,
                    'change': -18,
                    'trend': 'down'
                },
                'classrooms': {
                    'total': 128,
                    'available': 47,
                    'occupied': 68,
                    'utilization': 78,
                    'change': 12,
                    'trend': 'up'
                },
                'mess': {
                    'attendance': 847,
                    'rating': 4.6,
                    'waste_kg': 14.2,
                    'change': -12,
                    'trend': 'down'
                }
            }
        }
        
        return jsonify(kpis), 200
    
    except Exception as e:
        print(f'KPI error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load KPI data'
        }), 500


# ============================================================
# ANALYTICS ROUTES
# ============================================================

@dashboard_bp.route('/analytics/students', methods=['GET'])
def get_student_analytics():
    """
    Get student analytics data.
    
    GET /api/analytics/students
    
    Returns:
        JSON response with student analytics
    """
    try:
        # Generate mock attendance data for the last 30 days
        attendance_data = []
        for i in range(30):
            date = datetime.utcnow() - timedelta(days=29-i)
            attendance_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'overall': round(random.uniform(90, 97), 1),
                'cse': round(random.uniform(92, 98), 1),
                'ece': round(random.uniform(88, 96), 1)
            })
        
        analytics = {
            'success': True,
            'attendance_trend': attendance_data,
            'enrollment': {
                'CSE': 3247,
                'ECE': 2891,
                'MECH': 2456,
                'CIVIL': 2178,
                'EEE': 2075
            }
        }
        
        return jsonify(analytics), 200
    
    except Exception as e:
        print(f'Student analytics error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load student analytics'
        }), 500


@dashboard_bp.route('/analytics/complaints', methods=['GET'])
def get_complaint_analytics():
    """
    Get complaint analytics data.
    
    GET /api/analytics/complaints
    
    Returns:
        JSON response with complaint trends
    """
    try:
        analytics = {
            'success': True,
            'categories': {
                'Wi-Fi Issues': 24,
                'Water Supply': 18,
                'Food Quality': 12,
                'Maintenance': 9,
                'Others': 6
            },
            'weekly_trend': [
                {'week': 'Week 1', 'filed': 18, 'resolved': 15},
                {'week': 'Week 2', 'filed': 22, 'resolved': 20},
                {'week': 'Week 3', 'filed': 15, 'resolved': 18},
                {'week': 'Week 4', 'filed': 14, 'resolved': 16}
            ],
            'resolution_rate': 86.2,
            'avg_resolution_time': '2.3 days'
        }
        
        return jsonify(analytics), 200
    
    except Exception as e:
        print(f'Complaint analytics error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load complaint analytics'
        }), 500


@dashboard_bp.route('/analytics/classrooms', methods=['GET'])
def get_classroom_analytics():
    """
    Get classroom utilization analytics.
    
    GET /api/analytics/classrooms
    
    Returns:
        JSON response with classroom utilization data
    """
    try:
        analytics = {
            'success': True,
            'utilization_by_block': {
                'Block A': 92,
                'Block B': 85,
                'Block C': 78,
                'Block D': 64
            },
            'peak_hours': [
                {'hour': '9AM', 'utilization': 92},
                {'hour': '10AM', 'utilization': 88},
                {'hour': '11AM', 'utilization': 85},
                {'hour': '2PM', 'utilization': 87},
                {'hour': '3PM', 'utilization': 79}
            ],
            'total_rooms': 128,
            'avg_utilization': 78
        }
        
        return jsonify(analytics), 200
    
    except Exception as e:
        print(f'Classroom analytics error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load classroom analytics'
        }), 500


@dashboard_bp.route('/analytics/mess', methods=['GET'])
def get_mess_analytics():
    """
    Get mess food analytics.
    
    GET /api/analytics/mess
    
    Returns:
        JSON response with mess analytics
    """
    try:
        analytics = {
            'success': True,
            'ratings_trend': [
                {'date': '2026-07-18', 'rating': 4.5},
                {'date': '2026-07-19', 'rating': 4.6},
                {'date': '2026-07-20', 'rating': 4.4},
                {'date': '2026-07-21', 'rating': 4.7},
                {'date': '2026-07-22', 'rating': 4.6},
                {'date': '2026-07-23', 'rating': 4.8},
                {'date': '2026-07-24', 'rating': 4.6}
            ],
            'waste_trend': [
                {'day': 'Mon', 'waste_kg': 18.5},
                {'day': 'Tue', 'waste_kg': 16.2},
                {'day': 'Wed', 'waste_kg': 15.8},
                {'day': 'Thu', 'waste_kg': 14.2},
                {'day': 'Fri', 'waste_kg': 17.1}
            ],
            'popular_meals': [
                {'name': 'Paneer Tikka Masala', 'rating': 4.8, 'votes': 342},
                {'name': 'Biryani', 'rating': 4.7, 'votes': 298},
                {'name': 'Dosa & Chutney', 'rating': 4.5, 'votes': 276}
            ],
            'attendance': 847,
            'avg_rating': 4.6
        }
        
        return jsonify(analytics), 200
    
    except Exception as e:
        print(f'Mess analytics error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load mess analytics'
        }), 500


# ============================================================
# AI INSIGHTS ROUTE
# ============================================================

@dashboard_bp.route('/ai-insights', methods=['GET'])
def get_ai_insights():
    """
    Get AI-generated insights and recommendations.
    
    GET /api/ai-insights
    
    Returns:
        JSON response with AI insights
    """
    try:
        insights = {
            'success': True,
            'insights': [
                {
                    'id': 1,
                    'type': 'positive',
                    'title': 'Attendance Improving',
                    'description': 'Student attendance increased by 5.2% this week. Computer Science leads with 96.8% attendance.',
                    'confidence': 94,
                    'action': 'Continue current policies',
                    'impact': 'high'
                },
                {
                    'id': 2,
                    'type': 'warning',
                    'title': 'Complaint Spike Detected',
                    'description': 'Wi-Fi related complaints increased by 42% in the last 3 days. Recommend infrastructure review.',
                    'confidence': 87,
                    'action': 'Schedule IT infrastructure audit',
                    'impact': 'medium'
                },
                {
                    'id': 3,
                    'type': 'info',
                    'title': 'Optimal Room Usage',
                    'description': 'Block A classrooms show 92% utilization. Consider scheduling more classes in underutilized Block D.',
                    'confidence': 91,
                    'action': 'Redistribute class schedule',
                    'impact': 'medium'
                },
                {
                    'id': 4,
                    'type': 'success',
                    'title': 'Food Waste Reduced',
                    'description': 'Mess food waste decreased by 23% after implementing AI portion recommendations. Annual savings: ₹2.4L.',
                    'confidence': 96,
                    'action': 'Continue AI recommendations',
                    'impact': 'high'
                }
            ],
            'generated_at': datetime.utcnow().isoformat(),
            'model_version': '4.1.2'
        }
        
        return jsonify(insights), 200
    
    except Exception as e:
        print(f'AI insights error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load AI insights'
        }), 500


# ============================================================
# EXPORT ROUTE
# ============================================================

@dashboard_bp.route('/export/report', methods=['GET'])
def export_report():
    """
    Export analytics report.
    
    GET /api/export/report?format=json&timeframe=week
    
    Query parameters:
    - format: 'json', 'csv', 'pdf' (default: 'json')
    - timeframe: 'week', 'month', 'year' (default: 'week')
    
    Returns:
        Report data in requested format
    """
    try:
        report_format = request.args.get('format', 'json')
        timeframe = request.args.get('timeframe', 'week')
        
        # TODO: Generate actual report
        report_data = {
            'success': True,
            'report_type': 'comprehensive',
            'timeframe': timeframe,
            'generated_at': datetime.utcnow().isoformat(),
            'summary': {
                'total_students': 12847,
                'avg_attendance': 94.2,
                'open_complaints': 47,
                'room_utilization': 78,
                'food_rating': 4.6,
                'campus_health_score': 85
            },
            'details': {
                'students': 'Detailed student analytics...',
                'complaints': 'Detailed complaint analysis...',
                'classrooms': 'Detailed classroom utilization...',
                'mess': 'Detailed mess analytics...'
            }
        }
        
        return jsonify(report_data), 200
    
    except Exception as e:
        print(f'Export error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to export report'
        }), 500
