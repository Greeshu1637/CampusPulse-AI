"""
CampusPulse AI - Smart Dining Service
======================================

Complete service layer for Smart Dining module.

Services:
- StudentDiningService: Student-facing features
- MessManagerService: Mess manager operations
- AdminAnalyticsService: Analytics and reports
- AIRecommendationService: AI-powered recommendations

All business logic, validation, and database operations.
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


class StudentDiningService:
    """
    Student-facing dining services
    
    Features:
    - View today's menu
    - View weekly menu
    - Get meal status
    - Rate food
    - Submit feedback
    - Mark attendance
    - Search menu
    - View AI recommendations
    """
    
    @staticmethod
    def get_today_menu():
        """
        Get today's complete menu with all meals.
        
        Returns:
            dict: Today's menu with meals, ratings, and status
        """
        try:
            now = datetime.now()
            current_day = now.strftime('%A')
            current_time = now.strftime('%H:%M')
            
            # Get all menus for today
            menus = MessMenu.query.filter_by(
                day=current_day,
                is_published=True
            ).all()
            
            if not menus:
                return {
                    'success': False,
                    'message': 'No menu available for today'
                }
            
            meals = []
            for menu in menus:
                meal_status = StudentDiningService._calculate_meal_status(
                    menu.time_start,
                    menu.time_end,
                    current_time
                )
                
                meal_data = menu.to_dict(include_items=True, include_ratings=True)
                meal_data['status'] = meal_status
                meal_data['attendance_count'] = menu.get_attendance_count()
                meal_data['average_rating'] = menu.get_average_rating()
                
                meals.append(meal_data)
            
            # Sort meals by time
            meal_order = {'Breakfast': 1, 'Lunch': 2, 'Snacks': 3, 'Dinner': 4}
            meals.sort(key=lambda x: meal_order.get(x['meal_type'], 5))
            
            # Calculate overall rating
            total_rating = sum(m['average_rating'] for m in meals if m['average_rating'] > 0)
            meals_with_ratings = [m for m in meals if m['average_rating'] > 0]
            avg_rating = round(total_rating / len(meals_with_ratings), 1) if meals_with_ratings else 0.0
            
            # Count total ratings
            total_ratings = 0
            for menu in menus:
                for item in menu.items:
                    total_ratings += item.get_rating_count()
            
            return {
                'success': True,
                'date': now.strftime('%Y-%m-%d'),
                'day': current_day,
                'current_time': current_time,
                'meals': meals,
                'rating': avg_rating,
                'total_ratings': total_ratings,
                'total_items': sum(len(m['items']) for m in meals)
            }
            
        except Exception as e:
            print(f'Error fetching today menu: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error fetching menu: {str(e)}'
            }
    
    @staticmethod
    def get_weekly_menu():
        """
        Get complete weekly menu (7 days).
        
        Returns:
            dict: Weekly menu organized by day
        """
        try:
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            
            week_data = []
            for day in days:
                menus = MessMenu.query.filter_by(
                    day=day,
                    is_published=True
                ).all()
                
                if menus:
                    day_meals = []
                    for menu in menus:
                        meal_data = menu.to_dict(include_items=True)
                        meal_data['average_rating'] = menu.get_average_rating()
                        day_meals.append(meal_data)
                    
                    # Sort by meal order
                    meal_order = {'Breakfast': 1, 'Lunch': 2, 'Snacks': 3, 'Dinner': 4}
                    day_meals.sort(key=lambda x: meal_order.get(x['meal_type'], 5))
                    
                    week_data.append({
                        'day': day,
                        'date': None,  # Can be calculated based on current week
                        'meals': day_meals,
                        'total_items': sum(len(m['items']) for m in day_meals)
                    })
            
            return {
                'success': True,
                'week': week_data
            }
            
        except Exception as e:
            print(f'Error fetching weekly menu: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error fetching weekly menu: {str(e)}'
            }
    
    @staticmethod
    def search_menu(query, filters=None):
        """
        Search menu items by name, category, or dietary preference.
        
        Args:
            query (str): Search query
            filters (dict): Optional filters (is_veg, category, etc.)
        
        Returns:
            dict: Search results
        """
        try:
            # Base query
            items_query = MenuItem.query.join(MessMenu).filter(
                MessMenu.is_published == True
            )
            
            # Apply text search
            if query:
                items_query = items_query.filter(
                    or_(
                        MenuItem.item_name.ilike(f'%{query}%'),
                        MenuItem.description.ilike(f'%{query}%'),
                        MenuItem.category.ilike(f'%{query}%')
                    )
                )
            
            # Apply filters
            if filters:
                if 'is_veg' in filters:
                    items_query = items_query.filter(MenuItem.is_veg == filters['is_veg'])
                if 'category' in filters:
                    items_query = items_query.filter(MenuItem.category == filters['category'])
                if 'is_popular' in filters:
                    items_query = items_query.filter(MenuItem.is_popular == filters['is_popular'])
            
            items = items_query.all()
            
            results = []
            for item in items:
                item_data = item.to_dict(include_ratings=True)
                item_data['menu'] = {
                    'id': item.menu.id,
                    'day': item.menu.day,
                    'meal_type': item.menu.meal_type,
                    'time': f'{item.menu.time_start} - {item.menu.time_end}'
                }
                results.append(item_data)
            
            return {
                'success': True,
                'query': query,
                'filters': filters,
                'count': len(results),
                'results': results
            }
            
        except Exception as e:
            print(f'Error searching menu: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error searching menu: {str(e)}'
            }
    
    @staticmethod
    def rate_food(user_id, item_id, rating_value):
        """
        Submit or update food rating (1-5 stars).
        
        Args:
            user_id (int): Student user ID
            item_id (int): Menu item ID
            rating_value (int): Rating (1-5)
        
        Returns:
            dict: Success status and rating info
        """
        try:
            # Validate rating
            if not isinstance(rating_value, int) or rating_value < 1 or rating_value > 5:
                return {
                    'success': False,
                    'message': 'Rating must be between 1 and 5 stars'
                }
            
            # Check if item exists
            item = MenuItem.query.get(item_id)
            if not item:
                return {
                    'success': False,
                    'message': 'Menu item not found'
                }
            
            # Check for existing rating
            existing_rating = FoodRating.query.filter_by(
                item_id=item_id,
                user_id=user_id
            ).first()
            
            if existing_rating:
                # Update existing rating
                existing_rating.rating = rating_value
                existing_rating.updated_at = datetime.utcnow()
                message = 'Rating updated successfully'
            else:
                # Create new rating
                new_rating = FoodRating(
                    item_id=item_id,
                    user_id=user_id,
                    rating=rating_value
                )
                db.session.add(new_rating)
                message = 'Rating submitted successfully'
            
            db.session.commit()
            
            # Get updated stats
            avg_rating = item.get_average_rating()
            rating_count = item.get_rating_count()
            
            return {
                'success': True,
                'message': message,
                'rating': {
                    'item_id': item_id,
                    'item_name': item.item_name,
                    'your_rating': rating_value,
                    'average_rating': avg_rating,
                    'total_ratings': rating_count
                }
            }
            
        except Exception as e:
            db.session.rollback()
            print(f'Error submitting rating: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error submitting rating: {str(e)}'
            }
    
    @staticmethod
    def submit_feedback(user_id, item_id, feedback_text, feedback_type='general', is_anonymous=False):
        """
        Submit food feedback/suggestion.
        
        Args:
            user_id (int): Student user ID
            item_id (int): Menu item ID
            feedback_text (str): Feedback text
            feedback_type (str): Type (general, suggestion, complaint, praise)
            is_anonymous (bool): Submit anonymously
        
        Returns:
            dict: Success status and feedback info
        """
        try:
            # Validate input
            if not feedback_text or len(feedback_text.strip()) < 5:
                return {
                    'success': False,
                    'message': 'Feedback must be at least 5 characters'
                }
            
            # Check if item exists
            item = MenuItem.query.get(item_id)
            if not item:
                return {
                    'success': False,
                    'message': 'Menu item not found'
                }
            
            # Create feedback
            feedback = FoodFeedback(
                item_id=item_id,
                user_id=user_id,
                feedback_text=feedback_text.strip(),
                feedback_type=feedback_type,
                is_anonymous=is_anonymous
            )
            
            db.session.add(feedback)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Feedback submitted successfully',
                'feedback': feedback.to_dict()
            }
            
        except Exception as e:
            db.session.rollback()
            print(f'Error submitting feedback: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error submitting feedback: {str(e)}'
            }
    
    @staticmethod
    def mark_attendance(user_id, menu_id, attendance_date, is_attending=True, notes=None):
        """
        Mark meal attendance ("I'm eating today").
        
        Args:
            user_id (int): Student user ID
            menu_id (int): Menu ID
            attendance_date (date): Date of meal
            is_attending (bool): True = will attend
            notes (str): Optional notes
        
        Returns:
            dict: Success status
        """
        try:
            # Check if menu exists
            menu = MessMenu.query.get(menu_id)
            if not menu:
                return {
                    'success': False,
                    'message': 'Menu not found'
                }
            
            # Check for existing attendance record
            existing = MealAttendance.query.filter_by(
                menu_id=menu_id,
                user_id=user_id,
                attendance_date=attendance_date
            ).first()
            
            if existing:
                # Update existing record
                existing.is_attending = is_attending
                existing.notes = notes
                existing.updated_at = datetime.utcnow()
                message = 'Attendance updated successfully'
            else:
                # Create new record
                attendance = MealAttendance(
                    menu_id=menu_id,
                    user_id=user_id,
                    attendance_date=attendance_date,
                    is_attending=is_attending,
                    notes=notes
                )
                db.session.add(attendance)
                message = 'Attendance marked successfully'
            
            db.session.commit()
            
            # Get updated attendance count
            attendance_count = menu.get_attendance_count()
            
            return {
                'success': True,
                'message': message,
                'attendance': {
                    'menu_id': menu_id,
                    'meal_type': menu.meal_type,
                    'is_attending': is_attending,
                    'total_attending': attendance_count
                }
            }
            
        except Exception as e:
            db.session.rollback()
            print(f'Error marking attendance: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error marking attendance: {str(e)}'
            }
    
    @staticmethod
    def get_my_ratings(user_id, limit=10):
        """
        Get student's recent ratings.
        
        Args:
            user_id (int): Student user ID
            limit (int): Number of ratings to fetch
        
        Returns:
            dict: Student's ratings
        """
        try:
            ratings = FoodRating.query.filter_by(
                user_id=user_id
            ).order_by(desc(FoodRating.updated_at)).limit(limit).all()
            
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
    def _calculate_meal_status(start_time, end_time, current_time):
        """
        Calculate meal status based on time.
        
        Args:
            start_time (str): Start time (HH:MM)
            end_time (str): End time (HH:MM)
            current_time (str): Current time (HH:MM)
        
        Returns:
            str: 'upcoming', 'ongoing', or 'completed'
        """
        try:
            start_hour, start_min = map(int, start_time.split(':'))
            end_hour, end_min = map(int, end_time.split(':'))
            current_hour, current_min = map(int, current_time.split(':'))
            
            start_minutes = start_hour * 60 + start_min
            end_minutes = end_hour * 60 + end_min
            current_minutes = current_hour * 60 + current_min
            
            if current_minutes < start_minutes:
                return 'upcoming'
            elif current_minutes >= start_minutes and current_minutes <= end_minutes:
                return 'ongoing'
            else:
                return 'completed'
        except:
            return 'upcoming'


# Continue in next part...


class AIRecommendationService:
    """
    AI-powered recommendations for Smart Dining.
    
    Features:
    - Answer natural language questions
    - Filter by dietary preferences
    - Find highest rated meals
    - Predict requirements
    - Suggest improvements
    """
    
    @staticmethod
    def get_recommendations(user_id=None):
        """
        Get personalized AI recommendations for student.
        
        Args:
            user_id (int): Student user ID (optional)
        
        Returns:
            dict: AI recommendations
        """
        try:
            recommendations = []
            
            # Recommendation 1: Today's highest rated meal
            today_menu = StudentDiningService.get_today_menu()
            if today_menu['success'] and today_menu['meals']:
                highest_rated = max(
                    today_menu['meals'],
                    key=lambda x: x.get('average_rating', 0)
                )
                if highest_rated['average_rating'] > 0:
                    recommendations.append({
                        'type': 'highest_rated',
                        'title': f"🌟 Today's Top Rated: {highest_rated['meal_type']}",
                        'description': f"Rated {highest_rated['average_rating']}/5.0 by students. Don't miss it!",
                        'meal_type': highest_rated['meal_type'],
                        'time': highest_rated['time'],
                        'rating': highest_rated['average_rating']
                    })
            
            # Recommendation 2: Popular vegetarian options
            veg_results = StudentDiningService.search_menu('', filters={'is_veg': True, 'is_popular': True})
            if veg_results['success'] and veg_results['results']:
                top_veg = veg_results['results'][0]
                recommendations.append({
                    'type': 'popular_veg',
                    'title': f"🥗 Popular Veg Choice: {top_veg['item_name']}",
                    'description': f"Available on {top_veg['menu']['day']} - {top_veg['menu']['meal_type']}",
                    'item_name': top_veg['item_name'],
                    'rating': top_veg.get('average_rating', 0),
                    'menu': top_veg['menu']
                })
            
            # Recommendation 3: Balanced meal suggestion
            recommendations.append({
                'type': 'balanced_meal',
                'title': '🍽️ Balanced Meal Tip',
                'description': 'Try to include items from all categories: main course, side dish, and beverage for optimal nutrition.',
                'tip': 'balanced_diet'
            })
            
            # Recommendation 4: User-specific (if user_id provided)
            if user_id:
                recent_ratings = StudentDiningService.get_my_ratings(user_id, limit=5)
                if recent_ratings['success'] and recent_ratings['ratings']:
                    avg_user_rating = sum(r['rating'] for r in recent_ratings['ratings']) / len(recent_ratings['ratings'])
                    if avg_user_rating < 3:
                        recommendations.append({
                            'type': 'feedback_prompt',
                            'title': '💬 Share Your Feedback',
                            'description': 'We noticed you\'ve rated some items low. Help us improve by sharing detailed feedback!',
                            'action': 'provide_feedback'
                        })
            
            # Recommendation 5: Special meals alert
            special_meals = MessMenu.query.filter_by(
                is_special=True,
                is_published=True
            ).filter(
                MessMenu.day == datetime.now().strftime('%A')
            ).all()
            
            if special_meals:
                for meal in special_meals:
                    recommendations.append({
                        'type': 'special_meal',
                        'title': f'⭐ Special: {meal.special_item_name}',
                        'description': f"Don't miss today's special in {meal.meal_type}!",
                        'meal_type': meal.meal_type,
                        'time': f"{meal.time_start} - {meal.time_end}"
                    })
            
            return {
                'success': True,
                'count': len(recommendations),
                'recommendations': recommendations
            }
            
        except Exception as e:
            print(f'Error generating recommendations: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error generating recommendations: {str(e)}'
            }
    
    @staticmethod
    def answer_question(question):
        """
        Answer natural language questions about menu.
        
        Args:
            question (str): Question text
        
        Returns:
            dict: Answer with relevant data
        """
        try:
            question_lower = question.lower()
            
            # Question: What's today's breakfast?
            if 'today' in question_lower and 'breakfast' in question_lower:
                today_menu = StudentDiningService.get_today_menu()
                if today_menu['success']:
                    breakfast = next((m for m in today_menu['meals'] if m['meal_type'] == 'Breakfast'), None)
                    if breakfast:
                        items = [item['item_name'] for item in breakfast['items']]
                        return {
                            'success': True,
                            'question': question,
                            'answer': f"Today's breakfast ({breakfast['time']}) includes: {', '.join(items)}",
                            'data': breakfast
                        }
            
            # Question: Show only veg food
            if 'veg' in question_lower and ('only' in question_lower or 'show' in question_lower):
                veg_results = StudentDiningService.search_menu('', filters={'is_veg': True})
                if veg_results['success']:
                    return {
                        'success': True,
                        'question': question,
                        'answer': f"Found {veg_results['count']} vegetarian items in the menu",
                        'data': veg_results['results']
                    }
            
            # Question: Which meal has the highest rating?
            if 'highest' in question_lower and 'rating' in question_lower:
                today_menu = StudentDiningService.get_today_menu()
                if today_menu['success'] and today_menu['meals']:
                    highest_rated = max(
                        today_menu['meals'],
                        key=lambda x: x.get('average_rating', 0)
                    )
                    return {
                        'success': True,
                        'question': question,
                        'answer': f"Today's highest rated meal is {highest_rated['meal_type']} with {highest_rated['average_rating']}/5.0 stars",
                        'data': highest_rated
                    }
            
            # Question: Predict tomorrow's rice requirement
            if 'predict' in question_lower and 'rice' in question_lower:
                # Get average attendance from last week
                week_ago = date.today() - timedelta(days=7)
                attendance_count = MealAttendance.query.filter(
                    MealAttendance.attendance_date >= week_ago,
                    MealAttendance.is_attending == True
                ).count()
                
                # Estimate rice requirement (200g per person)
                estimated_students = attendance_count // 7  # Average per day
                rice_kg = (estimated_students * 200) / 1000  # Convert to kg
                
                return {
                    'success': True,
                    'question': question,
                    'answer': f"Based on last week's attendance (avg {estimated_students} students/day), estimated rice requirement: {rice_kg:.1f} kg",
                    'data': {
                        'estimated_students': estimated_students,
                        'rice_requirement_kg': round(rice_kg, 1),
                        'per_person_grams': 200
                    }
                }
            
            # Question: Suggest menu improvements
            if 'suggest' in question_lower or 'improve' in question_lower:
                # Find low-rated items
                low_rated_items = db.session.query(MenuItem).join(FoodRating).group_by(MenuItem.id).having(
                    func.avg(FoodRating.rating) < 3
                ).all()
                
                suggestions = []
                if low_rated_items:
                    for item in low_rated_items[:3]:
                        avg_rating = item.get_average_rating()
                        suggestions.append({
                            'item': item.item_name,
                            'current_rating': avg_rating,
                            'suggestion': f'Consider replacing or improving {item.item_name} (rated {avg_rating}/5.0)'
                        })
                
                return {
                    'success': True,
                    'question': question,
                    'answer': f"Found {len(suggestions)} items that could be improved",
                    'data': {
                        'suggestions': suggestions,
                        'general_tips': [
                            'Add more variety in vegetarian options',
                            'Include seasonal fruits',
                            'Offer low-calorie alternatives',
                            'Rotate special meals more frequently'
                        ]
                    }
                }
            
            # Default response
            return {
                'success': True,
                'question': question,
                'answer': "I can help you with questions about today's menu, vegetarian options, ratings, and predictions. Try asking 'What's today's breakfast?' or 'Show only veg food'.",
                'suggestions': [
                    "What's today's breakfast?",
                    "Show only veg food",
                    "Which meal has the highest rating?",
                    "Predict tomorrow's rice requirement",
                    "Suggest menu improvements"
                ]
            }
            
        except Exception as e:
            print(f'Error answering question: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error answering question: {str(e)}'
            }


# Export service classes
__all__ = [
    'StudentDiningService',
    'AIRecommendationService'
]
