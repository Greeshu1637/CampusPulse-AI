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

@dashboard_bp.route('/student/dashboard', methods=['GET'])
def get_student_dashboard():
    """
    Get student dashboard data.
    
    GET /api/student/dashboard
    
    Returns comprehensive dashboard data for students including:
    - Today's classes
    - Empty classrooms
    - Mess menu (from database)
    - Pending complaints
    - Announcements
    
    Returns:
        JSON response with student dashboard data
    """
    try:
        # Check authentication
        if not session.get('user_id'):
            return jsonify({
                'success': False,
                'message': 'Authentication required'
            }), 401
        
        user_name = session.get('user_name', 'Student')
        user_role = session.get('user_role', 'student')
        
        # Get current day and time
        from datetime import datetime, timedelta
        now = datetime.now()
        current_day = now.strftime('%A')
        current_time = now.strftime('%H:%M')
        
        # Today's Classes (Sample Data)
        todays_classes = [
            {
                'id': 1,
                'subject': 'Data Structures',
                'code': 'CS201',
                'time': '09:00 - 10:30',
                'room': 'Block A - 301',
                'professor': 'Dr. Sharma',
                'status': 'upcoming' if now.hour < 9 else 'ongoing' if now.hour < 10 else 'completed'
            },
            {
                'id': 2,
                'subject': 'Database Management',
                'code': 'CS301',
                'time': '11:00 - 12:30',
                'room': 'Block B - 205',
                'professor': 'Dr. Kumar',
                'status': 'upcoming' if now.hour < 11 else 'ongoing' if now.hour < 12 else 'completed'
            },
            {
                'id': 3,
                'subject': 'Operating Systems',
                'code': 'CS302',
                'time': '14:00 - 15:30',
                'room': 'Block A - 401',
                'professor': 'Dr. Patel',
                'status': 'upcoming' if now.hour < 14 else 'ongoing' if now.hour < 15 else 'completed'
            },
            {
                'id': 4,
                'subject': 'Computer Networks',
                'code': 'CS303',
                'time': '16:00 - 17:30',
                'room': 'Block C - 102',
                'professor': 'Dr. Singh',
                'status': 'upcoming'
            }
        ]
        
        # Empty Classrooms (Sample Data)
        empty_classrooms = [
            {
                'id': 1,
                'name': 'Block A - 201',
                'capacity': 60,
                'facilities': ['Projector', 'AC', 'Whiteboard'],
                'available_until': '14:00',
                'floor': 2,
                'block': 'A'
            },
            {
                'id': 2,
                'name': 'Block B - 105',
                'capacity': 40,
                'facilities': ['Smart Board', 'AC'],
                'available_until': '16:00',
                'floor': 1,
                'block': 'B'
            },
            {
                'id': 3,
                'name': 'Block C - 301',
                'capacity': 80,
                'facilities': ['Projector', 'AC', 'Sound System'],
                'available_until': '15:30',
                'floor': 3,
                'block': 'C'
            },
            {
                'id': 4,
                'name': 'Block D - 202',
                'capacity': 50,
                'facilities': ['Projector', 'Whiteboard'],
                'available_until': '17:00',
                'floor': 2,
                'block': 'D'
            }
        ]
        
        # Today's Mess Menu (From Database)
        from backend.services.mess_service import MessService
        mess_menu = MessService.get_today_menu()
        
        # If no menu found in database, provide default message
        if not mess_menu:
            mess_menu = {
                'date': now.strftime('%Y-%m-%d'),
                'day': current_day,
                'meals': [],
                'rating': 0.0,
                'total_ratings': 0
            }
        
        # Pending Complaints (Sample Data)
        pending_complaints = [
            {
                'id': 1,
                'title': 'Wi-Fi Not Working in Room 204',
                'category': 'Internet',
                'status': 'in_progress',
                'priority': 'high',
                'submitted_date': (now - timedelta(days=2)).strftime('%Y-%m-%d'),
                'description': 'Internet connection is very slow',
                'assigned_to': 'IT Team'
            },
            {
                'id': 2,
                'title': 'Water Leakage in Bathroom',
                'category': 'Plumbing',
                'status': 'pending',
                'priority': 'medium',
                'submitted_date': (now - timedelta(days=1)).strftime('%Y-%m-%d'),
                'description': 'Tap is leaking continuously',
                'assigned_to': 'Maintenance'
            },
            {
                'id': 3,
                'title': 'AC Not Cooling',
                'category': 'Electrical',
                'status': 'pending',
                'priority': 'low',
                'submitted_date': now.strftime('%Y-%m-%d'),
                'description': 'AC is making noise but not cooling',
                'assigned_to': None
            }
        ]
        
        # Announcements (Sample Data)
        announcements = [
            {
                'id': 1,
                'title': 'Mid-Semester Exams Schedule Released',
                'content': 'The mid-semester examination schedule has been released. Please check the academic portal for your schedule.',
                'category': 'Academic',
                'priority': 'high',
                'published_date': now.strftime('%Y-%m-%d'),
                'published_by': 'Academic Office',
                'icon': 'fa-calendar-check'
            },
            {
                'id': 2,
                'title': 'Library Extended Hours',
                'content': 'The library will remain open 24/7 during exam season starting next week.',
                'category': 'Facilities',
                'priority': 'medium',
                'published_date': (now - timedelta(days=1)).strftime('%Y-%m-%d'),
                'published_by': 'Library Administration',
                'icon': 'fa-book'
            },
            {
                'id': 3,
                'title': 'Tech Fest Registration Open',
                'content': 'Register for TechFest 2026! Multiple events including hackathons, coding competitions, and workshops.',
                'category': 'Events',
                'priority': 'medium',
                'published_date': (now - timedelta(days=2)).strftime('%Y-%m-%d'),
                'published_by': 'Student Affairs',
                'icon': 'fa-trophy'
            },
            {
                'id': 4,
                'title': 'Hostel Mess Menu Survey',
                'content': 'Share your feedback on the current mess menu. Survey closes this Friday.',
                'category': 'Mess',
                'priority': 'low',
                'published_date': (now - timedelta(days=3)).strftime('%Y-%m-%d'),
                'published_by': 'Mess Committee',
                'icon': 'fa-utensils'
            }
        ]
        
        # Quick Stats
        quick_stats = {
            'attendance_percentage': 92.5,
            'classes_today': len(todays_classes),
            'pending_assignments': 3,
            'upcoming_exams': 2,
            'library_books': 2,
            'mess_balance': 450.00
        }
        
        dashboard_data = {
            'success': True,
            'user': {
                'name': user_name,
                'role': user_role,
                'picture': session.get('user_picture'),
                'email': session.get('user_email')
            },
            'timestamp': now.isoformat(),
            'today': {
                'date': now.strftime('%Y-%m-%d'),
                'day': current_day,
                'time': current_time
            },
            'todays_classes': todays_classes,
            'empty_classrooms': empty_classrooms,
            'mess_menu': mess_menu,
            'pending_complaints': pending_complaints,
            'announcements': announcements,
            'quick_stats': quick_stats
        }
        
        return jsonify(dashboard_data), 200
    
    except Exception as e:
        print(f'Student dashboard error: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': 'Failed to load dashboard data'
        }), 500


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
