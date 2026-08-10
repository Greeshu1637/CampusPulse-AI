"""
CampusPulse AI - Mess Manager Service
======================================

Complete service layer for Mess Manager operations.

Features:
- CRUD operations for menus
- Manage menu items
- View ratings and feedback
- Generate reports
- Manage attendance
- Analytics dashboard

All business logic for mess manager role.
"""

from backend.database import db
from backend.models.mess import (
    MealTiming,
    MessMenu,
    MenuItem,
    FoodRating,
    FoodFeedback,
    MealAttendance
)
from backend.models.user import User
from datetime import datetime, date, timedelta
from sqlalchemy import func, and_, or_, desc
from sqlalchemy.exc import IntegrityError
import traceback


class MessManagerService:
    """
    Mess Manager Service
    
    Handles all mess manager operations:
    - Create/Edit/Delete menus
    - Manage menu items
    - View feedback and ratings
    - Generate reports
    - Dashboard analytics
    """
    
    # ============================================================
    # MENU CRUD OPERATIONS
    # ============================================================
    
    @staticmethod
    def create_menu(manager_id, menu_data):
        """
        Create a new menu.
        
        Args:
            manager_id (int): Manager user ID
            menu_data (dict): Menu details
                {
                    "day": "Monday",
                    "meal_type": "Breakfast",
                    "menu_date": "2026-07-29" (optional),
                    "time_start": "07:00",
                    "time_end": "09:00",
                    "is_special": false,
                    "special_item_name": null,
                    "is_festival": false,
                    "festival_name": null,
                    "description": "",
                    "estimated_servings": 3000,
                    "items": [
                        {
                            "item_name": "Idli",
                            "category": "Main Course",
                            "is_veg": true,
                            "is_popular": false,
                            "allergen_info": null,
                            "calories": 120,
                            "protein_g": 4.0,
                            "carbs_g": 25.0,
                            "fat_g": 0.5,
                            "description": null
                        }
                    ]
                }
        
        Returns:
            dict: Success status and menu data
        """
        try:
            # Validate required fields
            required = ['day', 'meal_type', 'time_start', 'time_end']
            for field in required:
                if field not in menu_data:
                    return {
                        'success': False,
                        'message': f'Missing required field: {field}'
                    }
            
            # Parse menu_date if provided
            menu_date = None
            if 'menu_date' in menu_data and menu_data['menu_date']:
                try:
                    menu_date = datetime.strptime(menu_data['menu_date'], '%Y-%m-%d').date()
                except ValueError:
                    return {
                        'success': False,
                        'message': 'Invalid date format. Use YYYY-MM-DD'
                    }
            
            # Check for duplicate menu
            existing = MessMenu.query.filter_by(
                day=menu_data['day'],
                meal_type=menu_data['meal_type'],
                menu_date=menu_date
            ).first()
            
            if existing:
                return {
                    'success': False,
                    'message': f'Menu already exists for {menu_data["day"]} - {menu_data["meal_type"]}'
                }
            
            # Create menu
            menu = MessMenu(
                day=menu_data['day'],
                meal_type=menu_data['meal_type'],
                menu_date=menu_date,
                time_start=menu_data['time_start'],
                time_end=menu_data['time_end'],
                is_special=menu_data.get('is_special', False),
                special_item_name=menu_data.get('special_item_name'),
                is_festival=menu_data.get('is_festival', False),
                festival_name=menu_data.get('festival_name'),
                description=menu_data.get('description'),
                estimated_servings=menu_data.get('estimated_servings', 0),
                is_published=menu_data.get('is_published', True),
                created_by=manager_id
            )
            
            db.session.add(menu)
            db.session.flush()  # Get menu ID without committing
            
            # Add menu items
            if 'items' in menu_data and menu_data['items']:
                for item_data in menu_data['items']:
                    item = MenuItem(
                        menu_id=menu.id,
                        item_name=item_data['item_name'],
                        category=item_data.get('category'),
                        is_veg=item_data.get('is_veg', True),
                        is_popular=item_data.get('is_popular', False),
                        allergen_info=item_data.get('allergen_info'),
                        calories=item_data.get('calories'),
                        protein_g=item_data.get('protein_g'),
                        carbs_g=item_data.get('carbs_g'),
                        fat_g=item_data.get('fat_g'),
                        description=item_data.get('description'),
                        image_url=item_data.get('image_url'),
                        preparation_note=item_data.get('preparation_note')
                    )
                    db.session.add(item)
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Menu created successfully',
                'menu': menu.to_dict(include_items=True)
            }
            
        except Exception as e:
            db.session.rollback()
            print(f'Error creating menu: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error creating menu: {str(e)}'
            }
    
    @staticmethod
    def update_menu(menu_id, menu_data):
        """
        Update an existing menu.
        
        Args:
            menu_id (int): Menu ID
            menu_data (dict): Updated menu details
        
        Returns:
            dict: Success status and updated menu data
        """
        try:
            menu = MessMenu.query.get(menu_id)
            if not menu:
                return {
                    'success': False,
                    'message': 'Menu not found'
                }
            
            # Update menu fields
            if 'time_start' in menu_data:
                menu.time_start = menu_data['time_start']
            if 'time_end' in menu_data:
                menu.time_end = menu_data['time_end']
            if 'is_special' in menu_data:
                menu.is_special = menu_data['is_special']
            if 'special_item_name' in menu_data:
                menu.special_item_name = menu_data['special_item_name']
            if 'is_festival' in menu_data:
                menu.is_festival = menu_data['is_festival']
            if 'festival_name' in menu_data:
                menu.festival_name = menu_data['festival_name']
            if 'description' in menu_data:
                menu.description = menu_data['description']
            if 'estimated_servings' in menu_data:
                menu.estimated_servings = menu_data['estimated_servings']
            if 'is_published' in menu_data:
                menu.is_published = menu_data['is_published']
            
            menu.updated_at = datetime.utcnow()
            
            # Update items if provided
            if 'items' in menu_data:
                # Delete existing items
                MenuItem.query.filter_by(menu_id=menu_id).delete()
                
                # Add new items
                for item_data in menu_data['items']:
                    item = MenuItem(
                        menu_id=menu.id,
                        item_name=item_data['item_name'],
                        category=item_data.get('category'),
                        is_veg=item_data.get('is_veg', True),
                        is_popular=item_data.get('is_popular', False),
                        allergen_info=item_data.get('allergen_info'),
                        calories=item_data.get('calories'),
                        protein_g=item_data.get('protein_g'),
                        carbs_g=item_data.get('carbs_g'),
                        fat_g=item_data.get('fat_g'),
                        description=item_data.get('description'),
                        image_url=item_data.get('image_url'),
                        preparation_note=item_data.get('preparation_note')
                    )
                    db.session.add(item)
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Menu updated successfully',
                'menu': menu.to_dict(include_items=True)
            }
            
        except Exception as e:
            db.session.rollback()
            print(f'Error updating menu: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error updating menu: {str(e)}'
            }
    
    @staticmethod
    def delete_menu(menu_id):
        """
        Delete a menu.
        
        Args:
            menu_id (int): Menu ID
        
        Returns:
            dict: Success status
        """
        try:
            menu = MessMenu.query.get(menu_id)
            if not menu:
                return {
                    'success': False,
                    'message': 'Menu not found'
                }
            
            db.session.delete(menu)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Menu deleted successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            print(f'Error deleting menu: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error deleting menu: {str(e)}'
            }
    
    @staticmethod
    def get_all_menus(filters=None):
        """
        Get all menus with optional filters.
        
        Args:
            filters (dict): Optional filters
                {
                    "day": "Monday",
                    "meal_type": "Breakfast",
                    "is_published": true,
                    "is_special": true
                }
        
        Returns:
            dict: List of menus
        """
        try:
            query = MessMenu.query
            
            if filters:
                if 'day' in filters:
                    query = query.filter_by(day=filters['day'])
                if 'meal_type' in filters:
                    query = query.filter_by(meal_type=filters['meal_type'])
                if 'is_published' in filters:
                    query = query.filter_by(is_published=filters['is_published'])
                if 'is_special' in filters:
                    query = query.filter_by(is_special=filters['is_special'])
            
            menus = query.order_by(MessMenu.created_at.desc()).all()
            
            return {
                'success': True,
                'count': len(menus),
                'menus': [menu.to_dict(include_items=True, include_ratings=True) for menu in menus]
            }
            
        except Exception as e:
            print(f'Error fetching menus: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error fetching menus: {str(e)}'
            }
    
    @staticmethod
    def get_menu_by_id(menu_id):
        """
        Get menu details by ID.
        
        Args:
            menu_id (int): Menu ID
        
        Returns:
            dict: Menu details
        """
        try:
            menu = MessMenu.query.get(menu_id)
            if not menu:
                return {
                    'success': False,
                    'message': 'Menu not found'
                }
            
            return {
                'success': True,
                'menu': menu.to_dict(include_items=True, include_ratings=True)
            }
            
        except Exception as e:
            print(f'Error fetching menu: {str(e)}')
            return {
                'success': False,
                'message': f'Error fetching menu: {str(e)}'
            }
    
    # ============================================================
    # RATINGS & FEEDBACK
    # ============================================================
    
    @staticmethod
    def get_all_ratings(filters=None, limit=50):
        """
        Get all ratings with optional filters.
        
        Args:
            filters (dict): Optional filters
            limit (int): Maximum results
        
        Returns:
            dict: List of ratings
        """
        try:
            query = FoodRating.query.join(MenuItem).join(MessMenu)
            
            if filters:
                if 'menu_id' in filters:
                    query = query.filter(MenuItem.menu_id == filters['menu_id'])
                if 'item_id' in filters:
                    query = query.filter(FoodRating.item_id == filters['item_id'])
                if 'min_rating' in filters:
                    query = query.filter(FoodRating.rating >= filters['min_rating'])
                if 'max_rating' in filters:
                    query = query.filter(FoodRating.rating <= filters['max_rating'])
            
            ratings = query.order_by(desc(FoodRating.created_at)).limit(limit).all()
            
            return {
                'success': True,
                'count': len(ratings),
                'ratings': [r.to_dict() for r in ratings]
            }
            
        except Exception as e:
            print(f'Error fetching ratings: {str(e)}')
            return {
                'success': False,
                'message': f'Error fetching ratings: {str(e)}'
            }
    
    @staticmethod
    def get_all_feedback(filters=None, limit=50):
        """
        Get all feedback with optional filters.
        
        Args:
            filters (dict): Optional filters
            limit (int): Maximum results
        
        Returns:
            dict: List of feedback
        """
        try:
            query = FoodFeedback.query.join(MenuItem).join(MessMenu)
            
            if filters:
                if 'menu_id' in filters:
                    query = query.filter(MenuItem.menu_id == filters['menu_id'])
                if 'item_id' in filters:
                    query = query.filter(FoodFeedback.item_id == filters['item_id'])
                if 'feedback_type' in filters:
                    query = query.filter(FoodFeedback.feedback_type == filters['feedback_type'])
                if 'is_reviewed' in filters:
                    query = query.filter(FoodFeedback.is_reviewed == filters['is_reviewed'])
            
            feedback_list = query.order_by(desc(FoodFeedback.created_at)).limit(limit).all()
            
            return {
                'success': True,
                'count': len(feedback_list),
                'feedback': [f.to_dict() for f in feedback_list]
            }
            
        except Exception as e:
            print(f'Error fetching feedback: {str(e)}')
            return {
                'success': False,
                'message': f'Error fetching feedback: {str(e)}'
            }
    
    @staticmethod
    def respond_to_feedback(feedback_id, manager_id, response_text):
        """
        Respond to student feedback.
        
        Args:
            feedback_id (int): Feedback ID
            manager_id (int): Manager user ID
            response_text (str): Response text
        
        Returns:
            dict: Success status
        """
        try:
            feedback = FoodFeedback.query.get(feedback_id)
            if not feedback:
                return {
                    'success': False,
                    'message': 'Feedback not found'
                }
            
            feedback.admin_response = response_text
            feedback.is_reviewed = True
            feedback.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Response submitted successfully',
                'feedback': feedback.to_dict()
            }
            
        except Exception as e:
            db.session.rollback()
            print(f'Error responding to feedback: {str(e)}')
            return {
                'success': False,
                'message': f'Error responding to feedback: {str(e)}'
            }
    
    # ============================================================
    # DASHBOARD ANALYTICS
    # ============================================================
    
    @staticmethod
    def get_dashboard_stats():
        """
        Get dashboard KPIs and statistics.
        
        Returns:
            dict: Dashboard statistics
        """
        try:
            # Today's attendance
            today = date.today()
            today_attendance = MealAttendance.query.filter_by(
                attendance_date=today,
                is_attending=True
            ).count()
            
            # Average rating
            avg_rating = db.session.query(func.avg(FoodRating.rating)).scalar()
            avg_rating = round(avg_rating, 1) if avg_rating else 0.0
            
            # Active feedback (unreviewed)
            active_feedback = FoodFeedback.query.filter_by(is_reviewed=False).count()
            
            # Total menus
            total_menus = MessMenu.query.filter_by(is_published=True).count()
            
            # Week's attendance trend
            week_ago = today - timedelta(days=7)
            weekly_attendance = db.session.query(
                MealAttendance.attendance_date,
                func.count(MealAttendance.id)
            ).filter(
                MealAttendance.attendance_date >= week_ago,
                MealAttendance.is_attending == True
            ).group_by(MealAttendance.attendance_date).all()
            
            # Popular items this week
            popular_items = db.session.query(
                MenuItem.item_name,
                func.avg(FoodRating.rating).label('avg_rating'),
                func.count(FoodRating.id).label('rating_count')
            ).join(FoodRating).filter(
                FoodRating.created_at >= datetime.utcnow() - timedelta(days=7)
            ).group_by(MenuItem.item_name).order_by(
                desc('avg_rating')
            ).limit(5).all()
            
            return {
                'success': True,
                'stats': {
                    'today_attendance': today_attendance,
                    'average_rating': avg_rating,
                    'active_feedback': active_feedback,
                    'total_menus': total_menus,
                    'food_waste_status': 'Low',  # TODO: Calculate from waste logs
                    'weekly_attendance': [
                        {'date': str(date), 'count': count}
                        for date, count in weekly_attendance
                    ],
                    'popular_items': [
                        {
                            'name': name,
                            'rating': round(float(rating), 1),
                            'count': count
                        }
                        for name, rating, count in popular_items
                    ]
                }
            }
            
        except Exception as e:
            print(f'Error fetching dashboard stats: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error fetching dashboard stats: {str(e)}'
            }
    
    # ============================================================
    # REPORTS
    # ============================================================
    
    @staticmethod
    def generate_attendance_report(start_date, end_date):
        """
        Generate attendance report for date range.
        
        Args:
            start_date (date): Start date
            end_date (date): End date
        
        Returns:
            dict: Attendance report
        """
        try:
            attendance_records = MealAttendance.query.filter(
                MealAttendance.attendance_date >= start_date,
                MealAttendance.attendance_date <= end_date,
                MealAttendance.is_attending == True
            ).all()
            
            # Group by date and meal
            report_data = {}
            for record in attendance_records:
                date_key = str(record.attendance_date)
                if date_key not in report_data:
                    report_data[date_key] = {}
                
                menu = record.menu
                meal_type = menu.meal_type
                if meal_type not in report_data[date_key]:
                    report_data[date_key][meal_type] = 0
                
                report_data[date_key][meal_type] += 1
            
            return {
                'success': True,
                'start_date': str(start_date),
                'end_date': str(end_date),
                'total_attendance': len(attendance_records),
                'report': report_data
            }
            
        except Exception as e:
            print(f'Error generating attendance report: {str(e)}')
            return {
                'success': False,
                'message': f'Error generating report: {str(e)}'
            }


# Export service class
__all__ = ['MessManagerService']
