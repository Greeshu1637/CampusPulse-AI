"""
CampusPulse AI - Complaint Model
==================================

This module defines the Complaint management models.

Models:
- Complaint: Main complaint entity
- ComplaintCategory: Predefined complaint categories
- ComplaintComment: Comments/updates on complaints
- ComplaintStatusHistory: Audit trail of status changes

Database: SQLAlchemy ORM with SQLite (dev) / PostgreSQL (prod)
"""

from datetime import datetime
from backend.database import db, TimestampMixin


class ComplaintCategory(db.Model, TimestampMixin):
    """
    Complaint Category model.
    
    Predefined categories for organizing complaints.
    
    Attributes:
        id (int): Primary key
        name (str): Category name (Electrical, Plumbing, etc.)
        icon (str): Font Awesome icon class
        color (str): UI color code
        description (str): Category description
        is_active (bool): Whether category is active
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'complaint_categories'
    
    # ===== PRIMARY KEY =====
    id = db.Column(db.Integer, primary_key=True)
    
    # ===== CATEGORY FIELDS =====
    name = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True,
        comment='Category name'
    )
    
    icon = db.Column(
        db.String(50),
        nullable=True,
        comment='Font Awesome icon class'
    )
    
    color = db.Column(
        db.String(20),
        nullable=True,
        comment='UI color code'
    )
    
    description = db.Column(
        db.String(200),
        nullable=True,
        comment='Category description'
    )
    
    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False,
        comment='Active status'
    )
    
    # ===== RELATIONSHIPS =====
    complaints = db.relationship(
        'Complaint',
        backref='category',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    
    def __repr__(self):
        return f'<ComplaintCategory {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'description': self.description,
            'is_active': self.is_active
        }


class Complaint(db.Model, TimestampMixin):
    """
    Complaint model.
    
    Main complaint entity for tracking student complaints.
    
    Attributes:
        id (int): Primary key
        complaint_id (str): Human-readable complaint ID (e.g., CMP-2143)
        student_id (int): Foreign key to users table
        hostel_block (str): Hostel block name
        room_number (str): Room number
        category_id (int): Foreign key to complaint_categories
        title (str): Complaint title
        description (str): Detailed description
        priority (str): Priority level (low, medium, high, critical)
        status (str): Current status (open, assigned, in_progress, resolved, closed)
        assigned_to (int): Foreign key to users (staff)
        resolved_at (datetime): Resolution timestamp
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'complaints'
    
    # ===== PRIMARY KEY =====
    id = db.Column(db.Integer, primary_key=True)
    
    # ===== COMPLAINT ID =====
    complaint_id = db.Column(
        db.String(20),
        unique=True,
        nullable=False,
        index=True,
        comment='Human-readable complaint ID (CMP-XXXX)'
    )
    
    # ===== STUDENT & LOCATION =====
    student_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
        comment='Student who filed the complaint'
    )
    
    hostel_block = db.Column(
        db.String(50),
        nullable=False,
        index=True,
        comment='Hostel block name (Main, Rudramadevi, etc.)'
    )
    
    room_number = db.Column(
        db.String(20),
        nullable=True,
        comment='Room number'
    )
    
    # ===== CATEGORY & DETAILS =====
    category_id = db.Column(
        db.Integer,
        db.ForeignKey('complaint_categories.id', ondelete='SET NULL'),
        nullable=True,
        index=True,
        comment='Complaint category'
    )
    
    title = db.Column(
        db.String(200),
        nullable=False,
        comment='Complaint title'
    )
    
    description = db.Column(
        db.Text,
        nullable=False,
        comment='Detailed description'
    )
    
    # ===== PRIORITY & STATUS =====
    priority = db.Column(
        db.String(20),
        nullable=False,
        default='medium',
        index=True,
        comment='Priority: low, medium, high, critical'
    )
    
    status = db.Column(
        db.String(20),
        nullable=False,
        default='open',
        index=True,
        comment='Status: open, assigned, in_progress, resolved, closed'
    )
    
    # ===== ASSIGNMENT =====
    assigned_to = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,
        index=True,
        comment='Staff member assigned to complaint'
    )
    
    # ===== TIMESTAMPS =====
    resolved_at = db.Column(
        db.DateTime,
        nullable=True,
        comment='Resolution timestamp'
    )
    
    # created_at and updated_at from TimestampMixin
    
    # ===== RELATIONSHIPS =====
    student = db.relationship(
        'User',
        foreign_keys=[student_id],
        backref='filed_complaints',
        lazy='joined'
    )
    
    assigned_staff = db.relationship(
        'User',
        foreign_keys=[assigned_to],
        backref='assigned_complaints',
        lazy='joined'
    )
    
    comments = db.relationship(
        'ComplaintComment',
        backref='complaint',
        lazy='dynamic',
        cascade='all, delete-orphan',
        order_by='ComplaintComment.created_at.desc()'
    )
    
    status_history = db.relationship(
        'ComplaintStatusHistory',
        backref='complaint',
        lazy='dynamic',
        cascade='all, delete-orphan',
        order_by='ComplaintStatusHistory.created_at.desc()'
    )
    
    # ===== INDEXES =====
    __table_args__ = (
        db.Index('idx_complaint_id', 'complaint_id'),
        db.Index('idx_student', 'student_id'),
        db.Index('idx_status', 'status'),
        db.Index('idx_priority', 'priority'),
        db.Index('idx_category', 'category_id'),
        db.Index('idx_assigned', 'assigned_to'),
        db.Index('idx_hostel_block', 'hostel_block'),
    )
    
    def __repr__(self):
        return f'<Complaint {self.complaint_id}: {self.title[:30]}>'
    
    def to_dict(self, include_relations=False):
        """Convert complaint to dictionary."""
        data = {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'student_id': self.student_id,
            'hostel_block': self.hostel_block,
            'room_number': self.room_number,
            'category_id': self.category_id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'assigned_to': self.assigned_to,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_relations:
            data['student'] = self.student.to_dict() if self.student else None
            data['assigned_staff'] = self.assigned_staff.to_dict() if self.assigned_staff else None
            data['category'] = self.category.to_dict() if self.category else None
        
        return data


class ComplaintComment(db.Model, TimestampMixin):
    """
    Complaint Comment model.
    
    Comments and updates on complaints.
    
    Attributes:
        id (int): Primary key
        complaint_id (int): Foreign key to complaints
        user_id (int): Foreign key to users (commenter)
        comment_text (str): Comment content
        is_internal (bool): Internal note (staff only)
        created_at (datetime): Creation timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'complaint_comments'
    
    # ===== PRIMARY KEY =====
    id = db.Column(db.Integer, primary_key=True)
    
    # ===== FOREIGN KEYS =====
    complaint_id = db.Column(
        db.Integer,
        db.ForeignKey('complaints.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
        comment='Complaint this comment belongs to'
    )
    
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
        comment='User who posted the comment'
    )
    
    # ===== COMMENT FIELDS =====
    comment_text = db.Column(
        db.Text,
        nullable=False,
        comment='Comment content'
    )
    
    is_internal = db.Column(
        db.Boolean,
        default=False,
        nullable=False,
        comment='Internal note (staff only)'
    )
    
    # created_at and updated_at from TimestampMixin
    
    # ===== RELATIONSHIPS =====
    user = db.relationship(
        'User',
        backref='complaint_comments',
        lazy='joined'
    )
    
    # ===== INDEXES =====
    __table_args__ = (
        db.Index('idx_complaint', 'complaint_id'),
        db.Index('idx_user', 'user_id'),
    )
    
    def __repr__(self):
        return f'<ComplaintComment {self.id} by User {self.user_id}>'
    
    def to_dict(self, include_user=False):
        """Convert comment to dictionary."""
        data = {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'user_id': self.user_id,
            'comment_text': self.comment_text,
            'is_internal': self.is_internal,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_user and self.user:
            data['user'] = self.user.to_dict()
        
        return data


class ComplaintStatusHistory(db.Model, TimestampMixin):
    """
    Complaint Status History model.
    
    Audit trail of status changes for complaints.
    
    Attributes:
        id (int): Primary key
        complaint_id (int): Foreign key to complaints
        old_status (str): Previous status
        new_status (str): New status
        changed_by (int): Foreign key to users (who made the change)
        notes (str): Optional notes about the change
        created_at (datetime): Change timestamp
        updated_at (datetime): Last update timestamp
    """
    
    __tablename__ = 'complaint_status_history'
    
    # ===== PRIMARY KEY =====
    id = db.Column(db.Integer, primary_key=True)
    
    # ===== FOREIGN KEYS =====
    complaint_id = db.Column(
        db.Integer,
        db.ForeignKey('complaints.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
        comment='Complaint this history belongs to'
    )
    
    # ===== STATUS CHANGE =====
    old_status = db.Column(
        db.String(20),
        nullable=True,
        comment='Previous status'
    )
    
    new_status = db.Column(
        db.String(20),
        nullable=False,
        comment='New status'
    )
    
    # ===== CHANGE TRACKING =====
    changed_by = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,
        index=True,
        comment='User who made the change'
    )
    
    notes = db.Column(
        db.Text,
        nullable=True,
        comment='Optional notes about the change'
    )
    
    # created_at and updated_at from TimestampMixin
    
    # ===== RELATIONSHIPS =====
    changed_by_user = db.relationship(
        'User',
        backref='status_changes',
        lazy='joined'
    )
    
    # ===== INDEXES =====
    __table_args__ = (
        db.Index('idx_complaint', 'complaint_id'),
        db.Index('idx_changed_by', 'changed_by'),
    )
    
    def __repr__(self):
        return f'<StatusHistory {self.old_status} → {self.new_status}>'
    
    def to_dict(self, include_user=False):
        """Convert status history to dictionary."""
        data = {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'changed_by': self.changed_by,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_user and self.changed_by_user:
            data['changed_by_user'] = self.changed_by_user.to_dict()
        
        return data


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def generate_complaint_id():
    """
    Generate unique complaint ID.
    
    Format: CMP-XXXX where XXXX is incremental number
    
    Returns:
        str: Unique complaint ID
    """
    # Get the last complaint
    last_complaint = Complaint.query.order_by(Complaint.id.desc()).first()
    
    if last_complaint and last_complaint.complaint_id:
        # Extract number from last ID (e.g., CMP-2143 → 2143)
        try:
            last_num = int(last_complaint.complaint_id.split('-')[1])
            next_num = last_num + 1
        except (IndexError, ValueError):
            next_num = 1
    else:
        next_num = 1
    
    return f'CMP-{next_num:04d}'


def get_complaint_by_id(complaint_id):
    """
    Get complaint by complaint_id.
    
    Args:
        complaint_id (str): Complaint ID (e.g., CMP-2143)
    
    Returns:
        Complaint: Complaint object or None
    """
    return Complaint.query.filter_by(complaint_id=complaint_id).first()


def get_active_categories():
    """
    Get all active complaint categories.
    
    Returns:
        list: List of active ComplaintCategory objects
    """
    return ComplaintCategory.query.filter_by(is_active=True).all()
