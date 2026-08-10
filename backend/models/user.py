"""
CampusPulse AI - User Model
============================

This module defines the User model for authentication and authorization.

The User model represents user accounts in the system, including:
- Students
- Faculty/Admin
- Maintenance staff
- Mess managers

Supports multiple authentication providers:
- Email/Password (traditional)
- Google OAuth 2.0

Database: SQLAlchemy ORM with SQLite (dev) / PostgreSQL (prod)
"""

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from backend.database import db, TimestampMixin


class User(db.Model, TimestampMixin):
    """
    User model for authentication and authorization.
    
    Represents a user account in the CampusPulse AI system.
    
    Supports multiple authentication providers:
    - email: Traditional email/password authentication
    - google: Google OAuth 2.0 authentication
    
    Attributes:
        id (int): Primary key
        google_id (str): Google OAuth ID (unique, nullable)
        email (str): User's email address (unique)
        password_hash (str): Hashed password (nullable for OAuth users)
        name (str): Full name
        profile_picture (str): URL to profile picture
        role (str): User role (student, admin, maintenance, mess)
        auth_provider (str): Authentication provider (email, google)
        is_active (bool): Account status
        is_verified (bool): Email verification status
        last_login (datetime): Last login timestamp
        created_at (datetime): Account creation timestamp (from TimestampMixin)
        updated_at (datetime): Last update timestamp (from TimestampMixin)
    """
    
    # Table name
    __tablename__ = 'users'
    
    # ===== PRIMARY KEY =====
    id = db.Column(db.Integer, primary_key=True)
    
    # ===== OAUTH FIELDS =====
    google_id = db.Column(
        db.String(255),
        unique=True,
        nullable=True,
        index=True,
        comment='Google OAuth unique identifier'
    )
    
    # ===== AUTHENTICATION FIELDS =====
    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False,
        index=True,
        comment='User email address'
    )
    
    password_hash = db.Column(
        db.String(255),
        nullable=True,
        comment='Hashed password (nullable for OAuth users)'
    )
    
    # ===== PROFILE FIELDS =====
    name = db.Column(
        db.String(100),
        nullable=False,
        comment='Full name'
    )
    
    profile_picture = db.Column(
        db.String(500),
        nullable=True,
        comment='URL to profile picture'
    )
    
    role = db.Column(
        db.String(20),
        nullable=False,
        default='student',
        comment='User role: student, admin, maintenance, mess'
    )
    
    auth_provider = db.Column(
        db.String(20),
        nullable=False,
        default='email',
        comment='Authentication provider: email, google'
    )
    
    # ===== STATUS FIELDS =====
    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False,
        comment='Account active status'
    )
    
    is_verified = db.Column(
        db.Boolean,
        default=False,
        nullable=False,
        comment='Email verification status'
    )
    
    # ===== TIMESTAMP FIELDS =====
    last_login = db.Column(
        db.DateTime,
        nullable=True,
        comment='Last login timestamp'
    )
    
    # created_at and updated_at are provided by TimestampMixin
    
    # ===== INDEXES =====
    __table_args__ = (
        db.Index('idx_email', 'email'),
        db.Index('idx_google_id', 'google_id'),
        db.Index('idx_auth_provider', 'auth_provider'),
    )
    
    # ===== METHODS =====
    
    def set_password(self, password):
        """
        Hash and set user password.
        
        Uses Werkzeug's security functions with pbkdf2:sha256 algorithm.
        
        Args:
            password (str): Plain text password
        """
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """
        Verify user password.
        
        Args:
            password (str): Plain text password to verify
        
        Returns:
            bool: True if password matches, False otherwise
        """
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        """
        Update last login timestamp to current time.
        """
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self, include_sensitive=False):
        """
        Convert user object to dictionary.
        
        Args:
            include_sensitive (bool): Include sensitive fields like email
        
        Returns:
            dict: User data as dictionary
        """
        data = {
            'id': self.id,
            'name': self.name,
            'role': self.role,
            'profile_picture': self.profile_picture,
            'auth_provider': self.auth_provider,
            'is_active': self.is_active,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_sensitive:
            data['email'] = self.email
            data['google_id'] = self.google_id
            data['is_verified'] = self.is_verified
        
        return data
    
    def __repr__(self):
        """String representation of User object."""
        return f'<User {self.email} ({self.auth_provider})>'


# ============================================================
# USER QUERY HELPERS
# ============================================================

def get_user_by_email(email):
    """
    Get user by email address.
    
    Args:
        email (str): User's email
    
    Returns:
        User: User object or None
    """
    return User.query.filter_by(email=email).first()


def get_user_by_google_id(google_id):
    """
    Get user by Google OAuth ID.
    
    Args:
        google_id (str): Google OAuth ID
    
    Returns:
        User: User object or None
    """
    return User.query.filter_by(google_id=google_id).first()


def get_user_by_id(user_id):
    """
    Get user by ID.
    
    Args:
        user_id (int): User's ID
    
    Returns:
        User: User object or None
    """
    return User.query.get(user_id)


def create_google_user(google_id, email, name, picture, role='student'):
    """
    Create a new user from Google OAuth data.
    
    Args:
        google_id (str): Google OAuth ID
        email (str): User's email
        name (str): User's name
        picture (str): Profile picture URL
        role (str): User role (default: 'student')
    
    Returns:
        User: Created user object
    """
    user = User(
        google_id=google_id,
        email=email,
        name=name,
        profile_picture=picture,
        role=role,
        auth_provider='google',
        is_active=True,
        is_verified=True  # Google emails are pre-verified
    )
    
    db.session.add(user)
    db.session.commit()
    
    return user
