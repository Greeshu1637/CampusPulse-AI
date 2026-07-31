"""
Smart Dining Routes
"""
from datetime import datetime, date
import csv
import io
from flask import render_template, request, jsonify, session, redirect, url_for, make_response
from campuspulse.blueprints.dining import dining_bp
from campuspulse.services.dining_service import DiningService


@dining_bp.route('/student')
def student_view():
    """Student view for Smart Dining"""
    role = session.get('role', 'student')
    user_name = session.get('user_name', 'User')
    user_id = session.get('user_id', 1)  # Temporary user ID
    
    return render_template(
        'dining/student.html',
        role=role,
        user_name=user_name,
        user_id=user_id
    )


@dining_bp.route('/manager')
def manager_view():
    """Mess Manager view for Smart Dining"""
    role = session.get('role', 'mess-manager')
    user_name = session.get('user_name', 'Manager')
    
    # Only mess managers can access
    if role != 'mess-manager':
        return redirect(url_for('dining.student_view'))
    
    return render_template(
        'dining/manager.html',
        role=role,
        user_name=user_name
    )


@dining_bp.route('/analytics')
def analytics_view():
    """Analytics view for Smart Dining"""
    role = session.get('role', 'mess-manager')
    user_name = session.get('user_name', 'Manager')
    
    # Only mess managers can access
    if role != 'mess-manager':
        return redirect(url_for('dining.student_view'))
    
    return render_template(
        'dining/analytics.html',
        role=role,
        user_name=user_name
    )


# API Routes

@dining_bp.route('/api/menu/today', methods=['GET'])
def get_today_menu():
    """Get today's menu"""
    try:
        menus = DiningService.get_today_menu()
        return jsonify({
            'success': True,
            'data': [menu.to_dict() for menu in menus]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/menu/date/<date_str>', methods=['GET'])
def get_menu_by_date(date_str):
    """Get menu by date"""
    try:
        meal_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        menus = DiningService.get_menu_by_date(meal_date)
        return jsonify({
            'success': True,
            'data': [menu.to_dict() for menu in menus]
        }), 200
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/menu', methods=['POST'])
def create_menu():
    """Create a new meal menu"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['meal_type', 'meal_date', 'menu_items']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Parse date
        meal_date = datetime.strptime(data['meal_date'], '%Y-%m-%d').date()
        
        # Get user ID from session
        created_by = session.get('user_id', 1)
        
        menu, error = DiningService.create_meal_menu(
            meal_type=data['meal_type'],
            meal_date=meal_date,
            menu_items=data['menu_items'],
            description=data.get('description'),
            calories=data.get('calories'),
            created_by=created_by
        )
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': menu.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': 'Invalid date format. Use YYYY-MM-DD'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/menu/<int:menu_id>', methods=['PUT'])
def update_menu(menu_id):
    """Update a meal menu"""
    try:
        data = request.get_json()
        
        # Parse date if provided
        if 'meal_date' in data and data['meal_date']:
            data['meal_date'] = datetime.strptime(data['meal_date'], '%Y-%m-%d').date()
        
        menu, error = DiningService.update_meal_menu(menu_id, **data)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': menu.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/menu/<int:menu_id>', methods=['DELETE'])
def delete_menu(menu_id):
    """Delete a meal menu"""
    try:
        success, error = DiningService.delete_meal_menu(menu_id)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'message': 'Menu deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit meal feedback"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['meal_menu_id', 'rating']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        user_id = session.get('user_id', 1)
        
        feedback, error = DiningService.submit_feedback(
            meal_menu_id=data['meal_menu_id'],
            user_id=user_id,
            rating=data['rating'],
            feedback_text=data.get('feedback_text')
        )
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': feedback.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/attendance', methods=['POST'])
def mark_attendance():
    """Mark meal attendance"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'meal_menu_id' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: meal_menu_id'
            }), 400
        
        user_id = session.get('user_id', 1)
        
        attendance, error = DiningService.mark_attendance(
            meal_menu_id=data['meal_menu_id'],
            user_id=user_id
        )
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': attendance.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/waste/<int:menu_id>', methods=['PUT'])
def update_waste(menu_id):
    """Update food waste"""
    try:
        data = request.get_json()
        
        if 'food_waste_kg' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: food_waste_kg'
            }), 400
        
        menu, error = DiningService.update_food_waste(
            menu_id=menu_id,
            food_waste_kg=float(data['food_waste_kg'])
        )
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        return jsonify({
            'success': True,
            'data': menu.to_dict()
        }), 200
        
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Invalid food waste value'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/history', methods=['GET'])
def get_meal_history():
    """Get user's meal history"""
    try:
        user_id = session.get('user_id', 1)
        limit = request.args.get('limit', 10, type=int)
        
        history = DiningService.get_user_meal_history(user_id, limit)
        
        return jsonify({
            'success': True,
            'data': history
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get dining analytics"""
    try:
        days = request.args.get('days', 7, type=int)
        analytics = DiningService.get_analytics(days)
        
        return jsonify({
            'success': True,
            'data': analytics
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@dining_bp.route('/api/analytics/export', methods=['GET'])
def export_analytics():
    """Export analytics data as CSV"""
    try:
        days = request.args.get('days', 7, type=int)
        analytics = DiningService.get_analytics(days)
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write summary
        writer.writerow(['Smart Dining Analytics Report'])
        writer.writerow(['Generated', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
        writer.writerow([])
        
        writer.writerow(['Summary Statistics'])
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Average Rating', analytics['average_rating']])
        writer.writerow(['Total Meals Served', analytics['total_meals_served']])
        writer.writerow(['Total Food Waste (kg)', analytics['total_food_waste']])
        writer.writerow(['Student Satisfaction (%)', analytics['student_satisfaction']])
        writer.writerow([])
        
        # Write daily attendance
        writer.writerow(['Daily Attendance'])
        writer.writerow(['Date', 'Attendance Count'])
        for item in analytics['daily_attendance']:
            writer.writerow([item['date'], item['count']])
        writer.writerow([])
        
        # Write rating trend
        writer.writerow(['Rating Trend'])
        writer.writerow(['Date', 'Average Rating'])
        for item in analytics['rating_trend']:
            writer.writerow([item['date'], item['rating']])
        writer.writerow([])
        
        # Write waste trend
        writer.writerow(['Food Waste Trend'])
        writer.writerow(['Date', 'Waste (kg)'])
        for item in analytics['waste_trend']:
            writer.writerow([item['date'], item['waste']])
        
        # Create response
        response = make_response(output.getvalue())
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=dining_analytics_{date.today()}.csv'
        
        return response
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
