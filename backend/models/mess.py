"""
CampusPulse AI - Complete Mess Management Models
=================================================

Production-ready models for Smart Dining system:
- MealTiming: Meal schedule and timings
- MessMenu: Menu configuration
- MenuItem: Individual food items
- FoodRating: Student ratings (1-5 stars)
- FoodFeedback: Detailed text feedback
- MealAttendance: Student meal attendance tracking

All models have proper relationships, indexes, and validation.
"""

from backend.database import db
from datetime import datetime
from sqlalchemy import Index, UniqueConstraint, CheckConstraint


class MealTiming(db.Model):
    """
    Meal Timing Configuration
    
    Stores standard meal times and current status.
    Used to determine if a meal is upcoming, ongoing, or completed.
    """
    __tablename__ = 'meal_timings'
    
    id = db.Column(db.Integer, primary_key=True)
    meal_type = db.Column(db.String(50), nullable=False, unique=True)  # Breakfast, Lunch, Snacks, Dinner
    start_time = db.Column(db.String(10), nullable=False)  # HH:MM format
    end_time = db.Column(db.String(10), nullable=False)    # HH:MM format
    is_active = db.Column(db.Boolean, default=True)
    is_closed = db.Column(db.Boolean, default=False)  # Temporarily closed by manager
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<MealTiming {self.meal_type} {self.start_time}-{self.end_time}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'meal_type': self.meal_type,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'is_active': self.is_active,
            'is_closed': self.is_closed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class MessMenu(db.Model):
    """
    Mess Menu Model
    
    Represents a meal menu for a specific day and meal type.
    Enhanced with publishing control and special meal flags.
    
    Relationships:
    - One-to-Many with MenuItem
    - One-to-Many with MealAttendance
    """
    __tablename__ = 'mess_menus'
    
    # Performance indexes
    __table_args__ = (
        Index('idx_menu_day_meal', 'day', 'meal_type'),
        Index('idx_menu_published', 'is_published'),
        Index('idx_menu_date', 'menu_date'),
        UniqueConstraint('day', 'meal_type', 'menu_date', name='unique_menu_per_day_meal'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.String(20), nullable=False)  # Monday, Tuesday, etc.
    meal_type = db.Column(db.String(20), nullable=False)  # Breakfast, Lunch, Snacks, Dinner
    menu_date = db.Column(db.Date, nullable=True)  # Specific date (optional, for weekly menu management)
    time_start = db.Column(db.String(10), nullable=False)  # e.g., "07:00"
    time_end = db.Column(db.String(10), nullable=False)    # e.g., "09:00"
    is_special = db.Column(db.Boolean, default=False)
    special_item_name = db.Column(db.String(100), nullable=True)
    is_published = db.Column(db.Boolean, default=True)  # Manager can unpublish
    is_festival = db.Column(db.Boolean, default=False)  # Festival special menu
    festival_name = db.Column(db.String(100), nullable=True)
    description = db.Column(db.Text, nullable=True)
    estimated_servings = db.Column(db.Integer, default=0)  # Estimated students
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Relationships
    items = db.relationship('MenuItem', backref='menu', lazy=True, cascade='all, delete-orphan')
    attendance_records = db.relationship('MealAttendance', backref='menu', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<MessMenu {self.day} - {self.meal_type}>'
    
    def to_dict(self, include_items=True, include_ratings=False):
        """Convert menu to dictionary"""
        result = {
            'id': self.id,
            'day': self.day,
            'meal_type': self.meal_type,
            'menu_date': self.menu_date.isoformat() if self.menu_date else None,
            'time': f'{self.time_start} - {self.time_end}',
            'time_start': self.time_start,
            'time_end': self.time_end,
            'is_special': self.is_special,
            'special_item_name': self.special_item_name,
            'is_published': self.is_published,
            'is_festival': self.is_festival,
            'festival_name': self.festival_name,
            'description': self.description,
            'estimated_servings': self.estimated_servings,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_items:
            result['items'] = [item.to_dict(include_ratings=include_ratings) for item in self.items]
        
        return result
    
    def get_attendance_count(self):
        """Get total attendance for this menu"""
        return MealAttendance.query.filter_by(menu_id=self.id, is_attending=True).count()
    
    def get_average_rating(self):
        """Calculate average rating across all items in this menu"""
        if not self.items:
            return 0.0
        ratings = []
        for item in self.items:
            item_rating = item.get_average_rating()
            if item_rating > 0:
                ratings.append(item_rating)
        if not ratings:
            return 0.0
        return round(sum(ratings) / len(ratings), 1)


class MenuItem(db.Model):
    """
    Menu Item Model
    
    Individual food item in a meal menu.
    Enhanced with nutritional info, allergen tags, and AI recommendations.
    
    Relationships:
    - Many-to-One with MessMenu
    - One-to-Many with FoodRating
    - One-to-Many with FoodFeedback
    """
    __tablename__ = 'menu_items'
    
    __table_args__ = (
        Index('idx_item_menu', 'menu_id'),
        Index('idx_item_veg', 'is_veg'),
        Index('idx_item_popular', 'is_popular'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    menu_id = db.Column(db.Integer, db.ForeignKey('mess_menus.id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=True)  # Main Course, Side Dish, Beverage, Dessert, Staple
    is_veg = db.Column(db.Boolean, default=True)
    is_popular = db.Column(db.Boolean, default=False)  # AI/Manager marked as popular
    allergen_info = db.Column(db.String(200), nullable=True)  # Comma-separated allergens
    calories = db.Column(db.Integer, nullable=True)  # Approximate calories
    protein_g = db.Column(db.Float, nullable=True)  # Protein in grams
    carbs_g = db.Column(db.Float, nullable=True)    # Carbs in grams
    fat_g = db.Column(db.Float, nullable=True)      # Fat in grams
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    preparation_note = db.Column(db.String(200), nullable=True)  # "Freshly Made", "Chef's Special"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ratings = db.relationship('FoodRating', backref='menu_item', lazy=True, cascade='all, delete-orphan')
    feedback = db.relationship('FoodFeedback', backref='menu_item', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<MenuItem {self.item_name}>'
    
    def to_dict(self, include_ratings=False):
        """Convert item to dictionary"""
        result = {
            'id': self.id,
            'menu_id': self.menu_id,
            'item_name': self.item_name,
            'category': self.category,
            'is_veg': self.is_veg,
            'is_popular': self.is_popular,
            'allergen_info': self.allergen_info,
            'calories': self.calories,
            'protein_g': self.protein_g,
            'carbs_g': self.carbs_g,
            'fat_g': self.fat_g,
            'description': self.description,
            'image_url': self.image_url,
            'preparation_note': self.preparation_note,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_ratings:
            result['average_rating'] = self.get_average_rating()
            result['rating_count'] = self.get_rating_count()
            result['recent_feedback'] = [f.to_dict() for f in self.get_recent_feedback(5)]
        
        return result
    
    def get_average_rating(self):
        """Calculate average rating for this item"""
        if not self.ratings:
            return 0.0
        total = sum(rating.rating for rating in self.ratings)
        return round(total / len(self.ratings), 1)
    
    def get_rating_count(self):
        """Get total number of ratings"""
        return len(self.ratings)
    
    def get_recent_feedback(self, limit=5):
        """Get recent feedback for this item"""
        return FoodFeedback.query.filter_by(item_id=self.id).order_by(FoodFeedback.created_at.desc()).limit(limit).all()


class FoodRating(db.Model):
    """
    Food Rating Model
    
    Stores student ratings (1-5 stars) for menu items.
    One rating per student per item (can be updated).
    
    Relationships:
    - Many-to-One with MenuItem
    - Many-to-One with User (student)
    """
    __tablename__ = 'food_ratings'
    
    __table_args__ = (
        Index('idx_rating_item', 'item_id'),
        Index('idx_rating_user', 'user_id'),
        Index('idx_rating_item_user', 'item_id', 'user_id'),
        UniqueConstraint('item_id', 'user_id', name='unique_rating_per_user_item'),
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to user
    user = db.relationship('User', backref='food_ratings', lazy=True)
    
    def __repr__(self):
        return f'<FoodRating {self.rating} stars for item {self.item_id} by user {self.user_id}>'
    
    def to_dict(self):
        """Convert rating to dictionary"""
        return {
            'id': self.id,
            'item_id': self.item_id,
            'item_name': self.menu_item.item_name if self.menu_item else None,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class FoodFeedback(db.Model):
    """
    Food Feedback Model
    
    Stores detailed text feedback from students about menu items.
    Multiple feedback entries allowed per student per item.
    
    Relationships:
    - Many-to-One with MenuItem
    - Many-to-One with User (student)
    """
    __tablename__ = 'food_feedback'
    
    __table_args__ = (
        Index('idx_feedback_item', 'item_id'),
        Index('idx_feedback_user', 'user_id'),
        Index('idx_feedback_date', 'created_at'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)
    feedback_type = db.Column(db.String(20), default='general')  # general, suggestion, complaint, praise
    is_anonymous = db.Column(db.Boolean, default=False)
    is_reviewed = db.Column(db.Boolean, default=False)  # Marked as reviewed by manager
    admin_response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='food_feedback', lazy=True)
    
    def __repr__(self):
        return f'<FoodFeedback for item {self.item_id} by user {self.user_id}>'
    
    def to_dict(self, include_user=True):
        """Convert feedback to dictionary"""
        result = {
            'id': self.id,
            'item_id': self.item_id,
            'item_name': self.menu_item.item_name if self.menu_item else None,
            'user_id': self.user_id if not self.is_anonymous else None,
            'feedback_text': self.feedback_text,
            'feedback_type': self.feedback_type,
            'is_anonymous': self.is_anonymous,
            'is_reviewed': self.is_reviewed,
            'admin_response': self.admin_response,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_user and not self.is_anonymous:
            result['user_name'] = self.user.name if self.user else None
            result['user_email'] = self.user.email if self.user else None
        else:
            result['user_name'] = 'Anonymous' if self.is_anonymous else None
        
        return result


class MealAttendance(db.Model):
    """
    Meal Attendance Model
    
    Tracks student meal attendance/registration.
    Students mark "I'm eating today" for meal planning.
    
    Relationships:
    - Many-to-One with MessMenu
    - Many-to-One with User (student)
    """
    __tablename__ = 'meal_attendance'
    
    __table_args__ = (
        Index('idx_attendance_menu', 'menu_id'),
        Index('idx_attendance_user', 'user_id'),
        Index('idx_attendance_date', 'attendance_date'),
        UniqueConstraint('menu_id', 'user_id', 'attendance_date', name='unique_attendance_per_user_menu_date'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    menu_id = db.Column(db.Integer, db.ForeignKey('mess_menus.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    attendance_date = db.Column(db.Date, nullable=False)  # Date of meal
    is_attending = db.Column(db.Boolean, default=True)  # True = will attend, False = cancelled
    marked_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.Column(db.String(200), nullable=True)  # Optional notes from student
    
    # Relationship to user
    user = db.relationship('User', backref='meal_attendance', lazy=True)
    
    def __repr__(self):
        return f'<MealAttendance menu {self.menu_id} user {self.user_id} date {self.attendance_date}>'
    
    def to_dict(self):
        """Convert attendance to dictionary"""
        return {
            'id': self.id,
            'menu_id': self.menu_id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'attendance_date': self.attendance_date.isoformat() if self.attendance_date else None,
            'is_attending': self.is_attending,
            'marked_at': self.marked_at.isoformat() if self.marked_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notes': self.notes
        }
