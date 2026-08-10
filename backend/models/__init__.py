"""
CampusPulse AI - Models Package
================================

This package contains all database models for the application.

Complete Smart Dining System Models:
- User: User accounts and authentication
- MealTiming: Meal schedule configuration
- MessMenu: Daily meal menus
- MenuItem: Individual food items
- FoodRating: Student ratings (1-5 stars)
- FoodFeedback: Detailed feedback
- MealAttendance: Student attendance tracking

Complete Complaint Management System Models:
- Complaint: Main complaint entity
- ComplaintCategory: Complaint categories
- ComplaintComment: Comments on complaints
- ComplaintStatusHistory: Audit trail of status changes
"""

from backend.models.user import User
from backend.models.mess import (
    MealTiming,
    MessMenu,
    MenuItem,
    FoodRating,
    FoodFeedback,
    MealAttendance
)
from backend.models.complaint import (
    Complaint,
    ComplaintCategory,
    ComplaintComment,
    ComplaintStatusHistory
)

__all__ = [
    'User',
    'MealTiming',
    'MessMenu',
    'MenuItem',
    'FoodRating',
    'Feedback',
    'MealAttendance',
    'Complaint',
    'ComplaintCategory',
    'ComplaintComment',
    'ComplaintStatusHistory'
]

# TODO: Import remaining models when implemented
# from .student import Student
# from .faculty import Faculty
# from .classroom import Classroom
