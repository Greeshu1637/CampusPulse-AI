"""
Database models for CampusPulse AI
"""
from datetime import datetime
from campuspulse import db


class User(db.Model):
    """User model for authentication and role management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(255), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'admin', 'mess_manager', 'hostel_manager', name='user_roles'), nullable=False, index=True)
    profile_picture_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_login_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    meal_feedbacks = db.relationship('MealFeedback', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    meal_attendances = db.relationship('MealAttendance', back_populates='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.name} ({self.role})>'


class MealMenu(db.Model):
    """Meal menu model for daily meal planning"""
    __tablename__ = 'meal_menus'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_type = db.Column(db.Enum('breakfast', 'lunch', 'snacks', 'dinner', name='meal_types'), nullable=False)
    meal_date = db.Column(db.Date, nullable=False, index=True)
    menu_items = db.Column(db.Text, nullable=False)  # JSON string or comma-separated
    description = db.Column(db.Text, nullable=True)
    calories = db.Column(db.Integer, nullable=True)
    attendance_count = db.Column(db.Integer, default=0, nullable=False)
    food_waste_kg = db.Column(db.Float, default=0.0, nullable=False)
    created_by = db.Column(db.Integer, nullable=True)  # User ID of mess manager
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    feedbacks = db.relationship('MealFeedback', back_populates='meal_menu', lazy='dynamic', cascade='all, delete-orphan')
    
    # Unique constraint: one meal per type per date
    __table_args__ = (
        db.UniqueConstraint('meal_type', 'meal_date', name='unique_meal_per_day'),
    )
    
    def __repr__(self):
        return f'<MealMenu {self.meal_type} on {self.meal_date}>'
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'meal_type': self.meal_type,
            'meal_date': self.meal_date.isoformat(),
            'menu_items': self.menu_items,
            'description': self.description,
            'calories': self.calories,
            'attendance_count': self.attendance_count,
            'food_waste_kg': self.food_waste_kg,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class MealFeedback(db.Model):
    """Meal feedback model for student ratings and comments"""
    __tablename__ = 'meal_feedbacks'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_menu_id = db.Column(db.Integer, db.ForeignKey('meal_menus.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    feedback_text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    meal_menu = db.relationship('MealMenu', back_populates='feedbacks')
    user = db.relationship('User', back_populates='meal_feedbacks')
    
    # Unique constraint: one feedback per user per meal
    __table_args__ = (
        db.UniqueConstraint('meal_menu_id', 'user_id', name='unique_feedback_per_user_per_meal'),
        db.CheckConstraint('rating >= 1 AND rating <= 5', name='valid_rating')
    )
    
    def __repr__(self):
        return f'<MealFeedback {self.rating} stars by User {self.user_id}>'
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'meal_menu_id': self.meal_menu_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'feedback_text': self.feedback_text,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class MealAttendance(db.Model):
    """Meal attendance model for tracking student meal consumption"""
    __tablename__ = 'meal_attendances'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_menu_id = db.Column(db.Integer, db.ForeignKey('meal_menus.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    marked_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', back_populates='meal_attendances')
    
    # Unique constraint: one attendance per user per meal
    __table_args__ = (
        db.UniqueConstraint('meal_menu_id', 'user_id', name='unique_attendance_per_user_per_meal'),
    )
    
    def __repr__(self):
        return f'<MealAttendance User {self.user_id} at Meal {self.meal_menu_id}>'
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'meal_menu_id': self.meal_menu_id,
            'user_id': self.user_id,
            'marked_at': self.marked_at.isoformat()
        }
