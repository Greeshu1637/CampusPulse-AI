"""
CampusPulse AI - Admin Analytics Service
=========================================

Complete analytics service for admin-level reporting and insights.

Features:
- System-wide analytics
- Attendance trends and predictions
- Food popularity analysis
- Rating trends
- Nutritional analysis
- Budget tracking
- Waste estimation
- Custom reports

All admin-level analytics and reporting logic.
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
from sqlalchemy import func, and_, or_, desc, distinct
from sqlalchemy.exc import IntegrityError
import traceback


class AdminAnalyticsService:
    """
    Admin Analytics Service
    
    Provides comprehensive analytics and reporting for administrators.
    """
    
    # ============================================================
    # DASHBOARD OVERVIEW
    # ============================================================
    
    @staticmethod
    def get_admin_dashboard():
        """
        Get comprehensive admin dashboard with all key metrics.
        
        Returns:
            dict: Complete dashboard data
        """
        try:
            today = date.today()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # Key metrics
            total_students = User.query.filter_by(role='student').count()
            
            # Today's attendance
            today_attendance = MealAttendance.query.filter_by(
                attendance_date=today,
                is_attending=True
            ).count()
            
            today_attendance_pct = round((today_attendance / total_students * 100), 1) if total_students > 0 else 0
            
            # Weekly attendance average
            weekly_attendance = db.session.query(
                func.count(MealAttendance.id)
            ).filter(
                MealAttendance.attendance_date >= week_ago,
                MealAttendance.is_attending == True
            ).scalar()
            
            weekly_avg = weekly_attendance // 7 if weekly_attendance else 0
            weekly_attendance_pct = round((weekly_avg / total_students * 100), 1) if total_students > 0 else 0
            
            # Total ratings
            total_ratings = FoodRating.query.count()
            
            # Average rating
            avg_rating = db.session.query(func.avg(FoodRating.rating)).scalar()
            avg_rating = round(avg_rating, 1) if avg_rating else 0.0
            
            # Food waste estimation (simplified)
            total_servings = db.session.query(
                func.sum(MessMenu.estimated_servings)
            ).filter(
                MessMenu.menu_date >= week_ago
            ).scalar() or 0
            
            actual_attendance = weekly_attendance or 0
            waste_percentage = round(((total_servings - actual_attendance) / total_servings * 100), 1) if total_servings > 0 else 0
            waste_status = 'Low' if waste_percentage < 10 else 'Medium' if waste_percentage < 20 else 'High'
            
            return {
                'success': True,
                'dashboard': {
                    'key_metrics': {
                        'total_students': total_students,
                        'today_attendance': today_attendance,
                        'today_attendance_pct': today_attendance_pct,
                        'weekly_avg_attendance': weekly_avg,
                        'weekly_attendance_pct': weekly_attendance_pct,
                        'total_ratings': total_ratings,
                        'average_rating': avg_rating,
                        'waste_percentage': waste_percentage,
                        'waste_status': waste_status
                    },
                    'attendance_trend': AdminAnalyticsService._get_attendance_trend(week_ago, today),
                    'rating_trend': AdminAnalyticsService._get_rating_trend(week_ago, today),
                    'popular_foods': AdminAnalyticsService._get_popular_foods(limit=10),
                    'unpopular_foods': AdminAnalyticsService._get_unpopular_foods(limit=10),
                    'meal_distribution': AdminAnalyticsService._get_meal_distribution()
                }
            }
            
        except Exception as e:
            print(f'Error fetching admin dashboard: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error fetching dashboard: {str(e)}'
            }
    
    # ============================================================
    # ATTENDANCE ANALYTICS
    # ============================================================
    
    @staticmethod
    def _get_attendance_trend(start_date, end_date):
        """Get daily attendance trend."""
        try:
            attendance_data = db.session.query(
                MealAttendance.attendance_date,
                func.count(MealAttendance.id).label('count')
            ).filter(
                MealAttendance.attendance_date >= start_date,
                MealAttendance.attendance_date <= end_date,
                MealAttendance.is_attending == True
            ).group_by(MealAttendance.attendance_date).order_by(
                MealAttendance.attendance_date
            ).all()
            
            return [
                {
                    'date': str(date),
                    'count': count
                }
                for date, count in attendance_data
            ]
        except Exception as e:
            print(f'Error getting attendance trend: {str(e)}')
            return []
    
    @staticmethod
    def get_attendance_report(start_date, end_date, group_by='day'):
        """
        Get detailed attendance report.
        
        Args:
            start_date (date): Start date
            end_date (date): End date
            group_by (str): 'day', 'week', or 'month'
        
        Returns:
            dict: Attendance report
        """
        try:
            # Daily report
            daily_attendance = db.session.query(
                MealAttendance.attendance_date,
                MessMenu.meal_type,
                func.count(MealAttendance.id).label('count')
            ).join(MessMenu).filter(
                MealAttendance.attendance_date >= start_date,
                MealAttendance.attendance_date <= end_date,
                MealAttendance.is_attending == True
            ).group_by(
                MealAttendance.attendance_date,
                MessMenu.meal_type
            ).order_by(
                MealAttendance.attendance_date,
                MessMenu.meal_type
            ).all()
            
            # Format report
            report = {}
            for date, meal_type, count in daily_attendance:
                date_str = str(date)
                if date_str not in report:
                    report[date_str] = {}
                report[date_str][meal_type] = count
            
            # Calculate totals
            total_attendance = sum(
                sum(meals.values()) for meals in report.values()
            )
            
            return {
                'success': True,
                'start_date': str(start_date),
                'end_date': str(end_date),
                'total_attendance': total_attendance,
                'daily_report': report
            }
            
        except Exception as e:
            print(f'Error generating attendance report: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error generating report: {str(e)}'
            }
    
    # ============================================================
    # RATING ANALYTICS
    # ============================================================
    
    @staticmethod
    def _get_rating_trend(start_date, end_date):
        """Get daily average rating trend."""
        try:
            rating_data = db.session.query(
                func.date(FoodRating.created_at).label('date'),
                func.avg(FoodRating.rating).label('avg_rating')
            ).filter(
                func.date(FoodRating.created_at) >= start_date,
                func.date(FoodRating.created_at) <= end_date
            ).group_by(
                func.date(FoodRating.created_at)
            ).order_by('date').all()
            
            return [
                {
                    'date': str(date),
                    'average_rating': round(float(avg_rating), 1)
                }
                for date, avg_rating in rating_data
            ]
        except Exception as e:
            print(f'Error getting rating trend: {str(e)}')
            return []
    
    @staticmethod
    def get_rating_report(start_date=None, end_date=None):
        """
        Get comprehensive rating report.
        
        Args:
            start_date (date): Start date (optional)
            end_date (date): End date (optional)
        
        Returns:
            dict: Rating report
        """
        try:
            query = db.session.query(FoodRating)
            
            if start_date:
                query = query.filter(func.date(FoodRating.created_at) >= start_date)
            if end_date:
                query = query.filter(func.date(FoodRating.created_at) <= end_date)
            
            ratings = query.all()
            
            if not ratings:
                return {
                    'success': True,
                    'message': 'No ratings found for the specified period',
                    'total_ratings': 0
                }
            
            # Calculate statistics
            rating_values = [r.rating for r in ratings]
            avg_rating = sum(rating_values) / len(rating_values)
            
            # Rating distribution
            distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            for rating in rating_values:
                distribution[rating] += 1
            
            # By meal type
            by_meal_type = db.session.query(
                MessMenu.meal_type,
                func.avg(FoodRating.rating).label('avg_rating'),
                func.count(FoodRating.id).label('count')
            ).join(MenuItem).join(MessMenu).filter(
                FoodRating.id.in_([r.id for r in ratings])
            ).group_by(MessMenu.meal_type).all()
            
            return {
                'success': True,
                'total_ratings': len(ratings),
                'average_rating': round(avg_rating, 1),
                'distribution': distribution,
                'by_meal_type': [
                    {
                        'meal_type': meal_type,
                        'average_rating': round(float(avg), 1),
                        'count': count
                    }
                    for meal_type, avg, count in by_meal_type
                ]
            }
            
        except Exception as e:
            print(f'Error generating rating report: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error generating report: {str(e)}'
            }
    
    # ============================================================
    # FOOD POPULARITY ANALYTICS
    # ============================================================
    
    @staticmethod
    def _get_popular_foods(limit=10):
        """Get most popular food items."""
        try:
            popular = db.session.query(
                MenuItem.item_name,
                MenuItem.category,
                MenuItem.is_veg,
                func.avg(FoodRating.rating).label('avg_rating'),
                func.count(FoodRating.id).label('rating_count')
            ).join(FoodRating).group_by(
                MenuItem.item_name,
                MenuItem.category,
                MenuItem.is_veg
            ).having(
                func.count(FoodRating.id) >= 5  # At least 5 ratings
            ).order_by(
                desc('avg_rating')
            ).limit(limit).all()
            
            return [
                {
                    'item_name': name,
                    'category': category,
                    'is_veg': is_veg,
                    'average_rating': round(float(rating), 1),
                    'rating_count': count
                }
                for name, category, is_veg, rating, count in popular
            ]
        except Exception as e:
            print(f'Error getting popular foods: {str(e)}')
            return []
    
    @staticmethod
    def _get_unpopular_foods(limit=10):
        """Get least popular food items."""
        try:
            unpopular = db.session.query(
                MenuItem.item_name,
                MenuItem.category,
                MenuItem.is_veg,
                func.avg(FoodRating.rating).label('avg_rating'),
                func.count(FoodRating.id).label('rating_count')
            ).join(FoodRating).group_by(
                MenuItem.item_name,
                MenuItem.category,
                MenuItem.is_veg
            ).having(
                func.count(FoodRating.id) >= 5  # At least 5 ratings
            ).order_by(
                'avg_rating'
            ).limit(limit).all()
            
            return [
                {
                    'item_name': name,
                    'category': category,
                    'is_veg': is_veg,
                    'average_rating': round(float(rating), 1),
                    'rating_count': count
                }
                for name, category, is_veg, rating, count in unpopular
            ]
        except Exception as e:
            print(f'Error getting unpopular foods: {str(e)}')
            return []
    
    @staticmethod
    def get_food_popularity_report():
        """
        Get comprehensive food popularity report.
        
        Returns:
            dict: Popularity report
        """
        try:
            # All items with ratings
            items_with_ratings = db.session.query(
                MenuItem.item_name,
                MenuItem.category,
                MenuItem.is_veg,
                MenuItem.calories,
                func.avg(FoodRating.rating).label('avg_rating'),
                func.count(FoodRating.id).label('rating_count')
            ).join(FoodRating).group_by(
                MenuItem.item_name,
                MenuItem.category,
                MenuItem.is_veg,
                MenuItem.calories
            ).all()
            
            return {
                'success': True,
                'total_items': len(items_with_ratings),
                'popular_items': AdminAnalyticsService._get_popular_foods(10),
                'unpopular_items': AdminAnalyticsService._get_unpopular_foods(10),
                'all_items': [
                    {
                        'item_name': name,
                        'category': category,
                        'is_veg': is_veg,
                        'calories': calories,
                        'average_rating': round(float(rating), 1),
                        'rating_count': count
                    }
                    for name, category, is_veg, calories, rating, count in items_with_ratings
                ]
            }
            
        except Exception as e:
            print(f'Error generating popularity report: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error generating report: {str(e)}'
            }
    
    # ============================================================
    # MEAL DISTRIBUTION
    # ============================================================
    
    @staticmethod
    def _get_meal_distribution():
        """Get attendance distribution by meal type."""
        try:
            week_ago = date.today() - timedelta(days=7)
            
            distribution = db.session.query(
                MessMenu.meal_type,
                func.count(MealAttendance.id).label('count')
            ).join(MealAttendance).filter(
                MealAttendance.attendance_date >= week_ago,
                MealAttendance.is_attending == True
            ).group_by(MessMenu.meal_type).all()
            
            return [
                {
                    'meal_type': meal_type,
                    'count': count
                }
                for meal_type, count in distribution
            ]
        except Exception as e:
            print(f'Error getting meal distribution: {str(e)}')
            return []
    
    # ============================================================
    # NUTRITIONAL ANALYSIS
    # ============================================================
    
    @staticmethod
    def get_nutritional_report():
        """
        Get nutritional analysis report.
        
        Returns:
            dict: Nutritional report
        """
        try:
            # Average nutritional values per meal type
            nutritional_data = db.session.query(
                MessMenu.meal_type,
                func.avg(MenuItem.calories).label('avg_calories'),
                func.avg(MenuItem.protein_g).label('avg_protein'),
                func.avg(MenuItem.carbs_g).label('avg_carbs'),
                func.avg(MenuItem.fat_g).label('avg_fat')
            ).join(MenuItem).group_by(MessMenu.meal_type).all()
            
            return {
                'success': True,
                'by_meal_type': [
                    {
                        'meal_type': meal_type,
                        'average_calories': round(float(calories), 1) if calories else 0,
                        'average_protein_g': round(float(protein), 1) if protein else 0,
                        'average_carbs_g': round(float(carbs), 1) if carbs else 0,
                        'average_fat_g': round(float(fat), 1) if fat else 0
                    }
                    for meal_type, calories, protein, carbs, fat in nutritional_data
                ]
            }
            
        except Exception as e:
            print(f'Error generating nutritional report: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error generating report: {str(e)}'
            }
    
    # ============================================================
    # FEEDBACK ANALYSIS
    # ============================================================
    
    @staticmethod
    def get_feedback_analysis(start_date=None, end_date=None):
        """
        Get feedback analysis and sentiment.
        
        Args:
            start_date (date): Start date (optional)
            end_date (date): End date (optional)
        
        Returns:
            dict: Feedback analysis
        """
        try:
            query = FoodFeedback.query
            
            if start_date:
                query = query.filter(func.date(FoodFeedback.created_at) >= start_date)
            if end_date:
                query = query.filter(func.date(FoodFeedback.created_at) <= end_date)
            
            feedback_list = query.all()
            
            if not feedback_list:
                return {
                    'success': True,
                    'message': 'No feedback found for the specified period',
                    'total_feedback': 0
                }
            
            # Count by type
            by_type = {}
            for feedback in feedback_list:
                ftype = feedback.feedback_type
                by_type[ftype] = by_type.get(ftype, 0) + 1
            
            # Reviewed vs unreviewed
            reviewed = sum(1 for f in feedback_list if f.is_reviewed)
            unreviewed = len(feedback_list) - reviewed
            
            return {
                'success': True,
                'total_feedback': len(feedback_list),
                'reviewed': reviewed,
                'unreviewed': unreviewed,
                'by_type': by_type,
                'recent_feedback': [
                    f.to_dict() for f in feedback_list[:10]
                ]
            }
            
        except Exception as e:
            print(f'Error analyzing feedback: {str(e)}')
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Error analyzing feedback: {str(e)}'
            }


# Export service class
__all__ = ['AdminAnalyticsService']
