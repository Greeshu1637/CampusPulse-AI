"""
CampusPulse AI - Database Configuration
========================================

This module sets up SQLAlchemy database connection and provides
database utilities for the application.

Features:
- SQLAlchemy ORM configuration
- Database session management
- Database initialization utilities
- Migration support

Current Configuration:
- Development: SQLite
- Production: PostgreSQL (configured via DATABASE_URL)
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# ============================================================
# INITIALIZE SQLALCHEMY
# ============================================================
# Create SQLAlchemy instance
# This will be initialized with the Flask app in app.py
db = SQLAlchemy()


# ============================================================
# DATABASE UTILITIES
# ============================================================

def init_db(app):
    """
    Initialize database with Flask app.
    
    Args:
        app: Flask application instance
    """
    db.init_app(app)
    
    with app.app_context():
        # Import all models to ensure they're registered with SQLAlchemy
        from backend.models.user import User
        
        # Create all tables
        db.create_all()
        
        print('✓ Database initialized successfully')


def reset_db(app):
    """
    Drop all tables and recreate them.
    
    WARNING: This will delete all data!
    Only use in development.
    
    Args:
        app: Flask application instance
    """
    with app.app_context():
        db.drop_all()
        db.create_all()
        print('✓ Database reset complete')


def seed_db(app):
    """
    Seed database with initial test data.
    
    Creates default users for testing.
    
    Args:
        app: Flask application instance
    """
    from backend.models.user import User
    
    with app.app_context():
        # Check if users already exist
        if User.query.first():
            print('✓ Database already seeded')
            return
        
        # Create test users
        test_users = [
            User(
                email='student@campuspulse.edu',
                name='Rahul Sharma',
                role='student',
                auth_provider='email',
                is_active=True,
                is_verified=True
            ),
            User(
                email='admin@campuspulse.edu',
                name='Dr. A. Kumar',
                role='admin',
                auth_provider='email',
                is_active=True,
                is_verified=True
            ),
            User(
                email='maintenance@campuspulse.edu',
                name='Rajesh Singh',
                role='maintenance',
                auth_provider='email',
                is_active=True,
                is_verified=True
            ),
            User(
                email='mess@campuspulse.edu',
                name='Suresh Patel',
                role='mess',
                auth_provider='email',
                is_active=True,
                is_verified=True
            )
        ]
        
        # Set passwords for email users
        test_users[0].set_password('student123')
        test_users[1].set_password('admin123')
        test_users[2].set_password('maintenance123')
        test_users[3].set_password('mess123')
        
        # Add to database
        for user in test_users:
            db.session.add(user)
        
        db.session.commit()
        print(f'✓ Database seeded with {len(test_users)} test users')


# ============================================================
# DATABASE SESSION HELPERS
# ============================================================

def get_or_create(model, **kwargs):
    """
    Get an existing record or create a new one.
    
    Args:
        model: SQLAlchemy model class
        **kwargs: Filter parameters
    
    Returns:
        tuple: (instance, created)
               instance: Model instance
               created: True if created, False if existing
    """
    instance = model.query.filter_by(**kwargs).first()
    if instance:
        return instance, False
    else:
        instance = model(**kwargs)
        db.session.add(instance)
        db.session.commit()
        return instance, True


def safe_commit():
    """
    Safely commit database changes with error handling.
    
    Returns:
        tuple: (success, error_message)
    """
    try:
        db.session.commit()
        return True, None
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        print(f'Database commit error: {error_msg}')
        return False, error_msg


# ============================================================
# TIMESTAMP MIXIN
# ============================================================

class TimestampMixin:
    """
    Mixin class to add created_at and updated_at timestamps
    to models.
    
    Usage:
        class MyModel(db.Model, TimestampMixin):
            pass
    """
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
