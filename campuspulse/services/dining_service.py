"""
Smart Dining Service Layer
Business logic for meal management, feedback, and analytics
"""
from datetime import date, datetime, timedelta
from typing import List, Dict, Optional, Tuple
from sqlalchemy import func, and_, desc
from campuspulse import db
from campuspulse.models import MealMenu, MealFeedback, MealAttendance, User


class DiningService:
    """Service class for Smart Dining operations"""
    
    @staticmethod
    def create_meal_menu(meal_type: str, meal_date: date, menu_items: str, 
                        description: str = None, calories: int = None, 
                        created_by: int = None) -> Tuple[Optional[MealMenu], Optional[str]]:
        """
        Create a new meal menu
        
        Args:
            meal_type: Type of meal (breakfast, lunch, snacks, dinner)
            meal_date: Date of the meal
            menu_items: Comma-separated menu items
            description: Optional description
            calories: Optional calorie count
            created_by: User ID of mess manager
            
        Returns:
            Tuple of (MealMenu object or None, error message or None)
        """
        # Validate meal type
        valid_types = ['breakfast', 'lunch', 'snacks', 'dinner']
        if meal_type not in valid_types:
            return None, f"Invalid meal type. Must be one of: {', '.join(valid_types)}"
        
        # Check for duplicate
        existing = MealMenu.query.filter_by(meal_type=meal_type, meal_date=meal_date).first()
        if existing:
            return None, f"Menu for {meal_type} on {meal_date} already exists"
        
        try:
            meal_menu = MealMenu(
                meal_type=meal_type,
                meal_date=meal_date,
                menu_items=menu_items,
                description=description,
                calories=calories,
                created_by=created_by
            )
            db.session.add(meal_menu)
            db.session.commit()
            return meal_menu, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
    
    @staticmethod
    def update_meal_menu(menu_id: int, **kwargs) -> Tuple[Optional[MealMenu], Optional[str]]:
        """Update existing meal menu"""
        meal_menu = MealMenu.query.get(menu_id)
        if not meal_menu:
            return None, "Menu not found"
        
        try:
            for key, value in kwargs.items():
                if hasattr(meal_menu, key) and value is not None:
                    setattr(meal_menu, key, value)
            db.session.commit()
            return meal_menu, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
    
    @staticmethod
    def get_menu_by_date(meal_date: date) -> List[MealMenu]:
        """Get all meals for a specific date"""
        return MealMenu.query.filter_by(meal_date=meal_date).order_by(
            db.case(
                (MealMenu.meal_type == 'breakfast', 1),
                (MealMenu.meal_type == 'lunch', 2),
                (MealMenu.meal_type == 'snacks', 3),
                (MealMenu.meal_type == 'dinner', 4)
            )
        ).all()
    
    @staticmethod
    def get_today_menu() -> List[MealMenu]:
        """Get today's meal menu"""
        return DiningService.get_menu_by_date(date.today())
    
    @staticmethod
    def submit_feedback(meal_menu_id: int, user_id: int, rating: int, 
                       feedback_text: str = None) -> Tuple[Optional[MealFeedback], Optional[str]]:
        """
        Submit or update meal feedback
        
        Args:
            meal_menu_id: ID of the meal menu
            user_id: ID of the user submitting feedback
            rating: Rating from 1-5
            feedback_text: Optional feedback text
            
        Returns:
            Tuple of (MealFeedback object or None, error message or None)
        """
        # Validate rating
        if not (1 <= rating <= 5):
            return None, "Rating must be between 1 and 5"
        
        # Check if meal exists
        meal_menu = MealMenu.query.get(meal_menu_id)
        if not meal_menu:
            return None, "Meal menu not found"
        
        try:
            # Check for existing feedback
            existing_feedback = MealFeedback.query.filter_by(
                meal_menu_id=meal_menu_id,
                user_id=user_id
            ).first()
            
            if existing_feedback:
                # Update existing feedback
                existing_feedback.rating = rating
                existing_feedback.feedback_text = feedback_text
                existing_feedback.updated_at = datetime.utcnow()
                db.session.commit()
                return existing_feedback, None
            else:
                # Create new feedback
                feedback = MealFeedback(
                    meal_menu_id=meal_menu_id,
                    user_id=user_id,
                    rating=rating,
                    feedback_text=feedback_text
                )
                db.session.add(feedback)
                db.session.commit()
                return feedback, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
    
    @staticmethod
    def mark_attendance(meal_menu_id: int, user_id: int) -> Tuple[Optional[MealAttendance], Optional[str]]:
        """
        Mark meal attendance for a user
        
        Args:
            meal_menu_id: ID of the meal menu
            user_id: ID of the user
            
        Returns:
            Tuple of (MealAttendance object or None, error message or None)
        """
        # Check if meal exists
        meal_menu = MealMenu.query.get(meal_menu_id)
        if not meal_menu:
            return None, "Meal menu not found"
        
        # Check for existing attendance
        existing = MealAttendance.query.filter_by(
            meal_menu_id=meal_menu_id,
            user_id=user_id
        ).first()
        
        if existing:
            return existing, None  # Already marked
        
        try:
            attendance = MealAttendance(
                meal_menu_id=meal_menu_id,
                user_id=user_id
            )
            db.session.add(attendance)
            
            # Update attendance count
            meal_menu.attendance_count += 1
            
            db.session.commit()
            return attendance, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
    
    @staticmethod
    def update_food_waste(menu_id: int, food_waste_kg: float) -> Tuple[Optional[MealMenu], Optional[str]]:
        """Update food waste for a meal"""
        if food_waste_kg < 0:
            return None, "Food waste cannot be negative"
        
        meal_menu = MealMenu.query.get(menu_id)
        if not meal_menu:
            return None, "Menu not found"
        
        try:
            meal_menu.food_waste_kg = food_waste_kg
            db.session.commit()
            return meal_menu, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
    
    @staticmethod
    def get_user_meal_history(user_id: int, limit: int = 10) -> List[Dict]:
        """Get user's meal attendance and feedback history"""
        attendances = db.session.query(
            MealAttendance, MealMenu, MealFeedback
        ).join(
            MealMenu, MealAttendance.meal_menu_id == MealMenu.id
        ).outerjoin(
            MealFeedback,
            and_(
                MealFeedback.meal_menu_id == MealMenu.id,
                MealFeedback.user_id == user_id
            )
        ).filter(
            MealAttendance.user_id == user_id
        ).order_by(
            desc(MealMenu.meal_date)
        ).limit(limit).all()
        
        history = []
        for attendance, meal, feedback in attendances:
            history.append({
                'meal_date': meal.meal_date.isoformat(),
                'meal_type': meal.meal_type,
                'menu_items': meal.menu_items,
                'attended_at': attendance.marked_at.isoformat(),
                'rating': feedback.rating if feedback else None,
                'feedback_text': feedback.feedback_text if feedback else None
            })
        
        return history
    
    @staticmethod
    def get_analytics(days: int = 7) -> Dict:
        """
        Get dining analytics for the specified number of days
        
        Args:
            days: Number of days to analyze (default 7)
            
        Returns:
            Dictionary with analytics data
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)
        
        # Get meals in date range
        meals = MealMenu.query.filter(
            MealMenu.meal_date.between(start_date, end_date)
        ).all()
        
        if not meals:
            return {
                'average_rating': 0,
                'total_meals_served': 0,
                'total_food_waste': 0,
                'student_satisfaction': 0,
                'daily_attendance': [],
                'rating_trend': [],
                'waste_trend': []
            }
        
        # Calculate average rating
        feedbacks = db.session.query(
            func.avg(MealFeedback.rating)
        ).join(
            MealMenu
        ).filter(
            MealMenu.meal_date.between(start_date, end_date)
        ).scalar()
        
        average_rating = round(float(feedbacks), 2) if feedbacks else 0
        
        # Total meals served
        total_meals_served = sum(meal.attendance_count for meal in meals)
        
        # Total food waste
        total_food_waste = sum(meal.food_waste_kg for meal in meals)
        
        # Student satisfaction (percentage of ratings >= 4)
        total_feedbacks = db.session.query(
            func.count(MealFeedback.id)
        ).join(
            MealMenu
        ).filter(
            MealMenu.meal_date.between(start_date, end_date)
        ).scalar() or 0
        
        satisfied_count = db.session.query(
            func.count(MealFeedback.id)
        ).join(
            MealMenu
        ).filter(
            MealMenu.meal_date.between(start_date, end_date),
            MealFeedback.rating >= 4
        ).scalar() or 0
        
        student_satisfaction = round((satisfied_count / total_feedbacks * 100), 1) if total_feedbacks > 0 else 0
        
        # Daily attendance trend
        daily_attendance = db.session.query(
            MealMenu.meal_date,
            func.sum(MealMenu.attendance_count).label('total')
        ).filter(
            MealMenu.meal_date.between(start_date, end_date)
        ).group_by(
            MealMenu.meal_date
        ).order_by(
            MealMenu.meal_date
        ).all()
        
        # Rating trend
        rating_trend = db.session.query(
            MealMenu.meal_date,
            func.avg(MealFeedback.rating).label('avg_rating')
        ).join(
            MealFeedback
        ).filter(
            MealMenu.meal_date.between(start_date, end_date)
        ).group_by(
            MealMenu.meal_date
        ).order_by(
            MealMenu.meal_date
        ).all()
        
        # Waste trend
        waste_trend = db.session.query(
            MealMenu.meal_date,
            func.sum(MealMenu.food_waste_kg).label('total_waste')
        ).filter(
            MealMenu.meal_date.between(start_date, end_date)
        ).group_by(
            MealMenu.meal_date
        ).order_by(
            MealMenu.meal_date
        ).all()
        
        return {
            'average_rating': average_rating,
            'total_meals_served': total_meals_served,
            'total_food_waste': round(total_food_waste, 2),
            'student_satisfaction': student_satisfaction,
            'daily_attendance': [
                {'date': d.isoformat(), 'count': int(c)} for d, c in daily_attendance
            ],
            'rating_trend': [
                {'date': d.isoformat(), 'rating': round(float(r), 2)} for d, r in rating_trend
            ],
            'waste_trend': [
                {'date': d.isoformat(), 'waste': round(float(w), 2)} for d, w in waste_trend
            ]
        }
    
    @staticmethod
    def delete_meal_menu(menu_id: int) -> Tuple[bool, Optional[str]]:
        """Delete a meal menu"""
        meal_menu = MealMenu.query.get(menu_id)
        if not meal_menu:
            return False, "Menu not found"
        
        try:
            db.session.delete(meal_menu)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, f"Database error: {str(e)}"
