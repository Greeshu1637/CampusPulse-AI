"""
User Model
Represents authenticated users with role-based access control
"""
from datetime import datetime
from flask_login import UserMixin
from app import db


class User(UserMixin, db.Model):
    """
    User model for authentication and authorization
    
    Roles:
    - student: Students living in hostel
    - admin: System administrator with full access
    - mess_manager: Manages mess operations
    - hostel_manager: Manages hostel operations and complaints
    """
    
    __tablename__ = 'users'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Google OAuth fields
    google_id = db.Column(db.String(255), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    
    # User information
    name = db.Column(db.String(255), nullable=False)
    profile_picture_url = db.Column(db.String(500))
    
    # Role-based access control
    role = db.Column(
        db.Enum('student', 'admin', 'mess_manager', 'hostel_manager', name='user_roles'),
        nullable=False,
        default='student',
        index=True
    )
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
    
    def to_dict(self):
        """Convert user object to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'google_id': self.google_id,
            'email': self.email,
            'name': self.name,
            'profile_picture_url': self.profile_picture_url,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
        }
    
    def has_role(self, *roles):
        """Check if user has any of the specified roles"""
        return self.role in roles
    
    def update_last_login(self):
        """Update the last login timestamp"""
        self.last_login_at = datetime.utcnow()
        db.session.commit()
