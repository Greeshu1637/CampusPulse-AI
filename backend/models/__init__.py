"""
CampusPulse AI - Models Package
================================

This package contains all database models for the application.

Models represent database tables and define:
- Table structure (columns, types, constraints)
- Relationships between tables
- Business logic methods
- Data validation

When database is implemented, models will use SQLAlchemy ORM:
- User: User accounts and authentication
- Student: Student profile data
- Faculty: Faculty member data
- Complaint: Complaint tracking
- Classroom: Classroom and scheduling
- Mess: Mess menu and ratings
- Analytics: Analytics and metrics storage

Currently contains placeholder models for development.
"""

__all__ = ['User']

# TODO: Import all models when database is set up
# from .user import User
# from .student import Student
# from .faculty import Faculty
# from .complaint import Complaint
# from .classroom import Classroom
# from .mess import Mess
