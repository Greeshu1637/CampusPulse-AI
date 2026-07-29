"""
CampusPulse AI - Routes Package
================================

This package contains all Flask blueprints for the application.

Blueprints organize the application into modular components,
each handling a specific feature area:

- auth: Authentication and authorization routes
- dashboard: Main dashboard and analytics routes
- classroom: Classroom management routes (future)
- complaints: Complaint management routes (future)
- mess: Mess management routes (future)
- analytics: Analytics and reporting routes (future)

Each blueprint is imported and registered in app.py.
"""

__all__ = ['auth', 'dashboard']
