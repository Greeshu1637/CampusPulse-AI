"""
CampusPulse AI - Mess Service (Legacy)
========================================

Legacy compatibility layer for old mess routes.
Redirects to new Smart Dining service.

Note: New Smart Dining features use smart_dining_service.py
"""

from datetime import datetime
from backend.database import db
from backend.models.mess import MessMenu, MenuItem, FoodRating


class MessService:
    """Legacy service class for mess operations"""
    
    @staticmethod
    def get_current_day():
        """Get current day of the week"""
        return datetime.now().strftime('%A')
    
    @staticmethod
    def get_current_time():
        """Get current time in HH:MM format"""
        return datetime.now().strftime('%H:%M')
    
    @staticmethod
    def get_meal_status(time_start, time_end):
        """
        Determine meal status based on current time
        
        Returns: 'upcoming', 'ongoing', or 'completed'
        """
        current_time = MessService.get_current_time()
        
        try:
            start_hour, start_min = map(int, time_start.split(':'))
            end_hour, end_min = map(int, time_end.split(':'))
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
    
    @staticmethod
    def get_today_menu():
        """
        Get today's complete menu with all meals
        Uses new Smart Dining service
        """
        from backend.services.smart_dining_service import StudentDiningService
        return StudentDiningService.get_today_menu()
    
    @staticmethod
    def get_weekly_menu():
        """
        Get weekly menu
        Uses new Smart Dining service
        """
        from backend.services.smart_dining_service import StudentDiningService
        result = StudentDiningService.get_weekly_menu()
        return result if result['success'] else None


def seed_mess_data():
    """
    Legacy seeding function
    Redirects to new Smart Dining seeding
    """
    print('🔄 Redirecting to Smart Dining seeding...')
    from backend.services.seed_smart_dining import seed_smart_dining
    seed_smart_dining()
