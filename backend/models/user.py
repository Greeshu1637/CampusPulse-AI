"""
CampusPulse AI - User Model
============================

This module defines the User model for authentication and authorization.

The User model represents user accounts in the system, including:
- Students
- Faculty/Admin
- Maintenance staff
- Mess managers

When database is implemented, this will be a proper SQLAlchemy model
with database columns, relationships, and methods.

Current Status: PLACEHOLDER
Will be implemented when PostgreSQL database is set up.
"""

from datetime import datetime
# TODO: Uncomment when database is set up
# from flask_sqlalchemy import SQLAlchemy
# from werkzeug.security import generate_password_hash, check_password_hash

# db = SQLAlchemy()


class User:
    """
    User model placeholder.
    
    Represents a user account in the CampusPulse AI system.
    
    Attributes (planned for database implementation):
        id (int): Primary key
        email (str): User's email address (unique)
        password_hash (str): Hashed password
        name (str): Full name
        role (str): User role (student, admin, maintenance, mess)
        department (str): Department (for students/faculty)
        phone (str): Contact number
        is_active (bool): Account status
        is_verified (bool): Email verification status
        created_at (datetime): Account creation timestamp
        last_login (datetime): Last login timestamp
        profile_picture (str): URL to profile picture
        
    Relationships (planned):
        - complaints: One-to-many with Complaint model
        - ratings: One-to-many with MessRating model
        - bookings: One-to-many with ClassroomBooking model
    
    Methods (planned):
        - set_password(password): Hash and set password
        - check_password(password): Verify password
        - generate_auth_token(): Generate JWT token
        - verify_auth_token(token): Verify JWT token
        - to_dict(): Convert user object to dictionary
    """
    
    def __init__(self, id, email, name, role, department=None):
        """
        Initialize User object (placeholder).
        
        Args:
            id (int): User ID
            email (str): User email
            name (str): User name
            role (str): User role
            department (str, optional): User department
        """
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.department = department
        self.is_active = True
        self.is_verified = True
        self.created_at = datetime.utcnow()
        self.last_login = datetime.utcnow()
    
    def to_dict(self):
        """
        Convert user object to dictionary.
        
        Returns:
            dict: User data as dictionary
        """
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'department': self.department,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        """String representation of User object."""
        return f'<User {self.email}>'


# ============================================================
# DATABASE MODEL (TO BE IMPLEMENTED)
# ============================================================
"""
When database is set up, replace above with SQLAlchemy model:

class User(db.Model):
    '''User account model.'''
    
    __tablename__ = 'users'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Authentication
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile Information
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # student, admin, maintenance, mess
    department = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    profile_picture = db.Column(db.String(255))
    
    # Account Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    complaints = db.relationship('Complaint', backref='user', lazy='dynamic')
    ratings = db.relationship('MessRating', backref='user', lazy='dynamic')
    bookings = db.relationship('ClassroomBooking', backref='user', lazy='dynamic')
    
    def set_password(self, password):
        '''Hash and set user password.'''
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        '''Verify user password.'''
        return check_password_hash(self.password_hash, password)
    
    def generate_auth_token(self, expiration=3600):
        '''Generate authentication token (JWT).'''
        # TODO: Implement JWT token generation
        pass
    
    @staticmethod
    def verify_auth_token(token):
        '''Verify authentication token.'''
        # TODO: Implement JWT token verification
        pass
    
    def to_dict(self):
        '''Convert user to dictionary.'''
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'department': self.department,
            'phone': self.phone,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.email}>'
"""
