"""
CampusPulse AI - Complaints Service
====================================

Business logic for complaint management.

Functions:
- get_all_categories(): Get all complaint categories
- get_complaints(): Get complaints with filters
- get_complaint_by_id(): Get single complaint details
- create_complaint(): Create new complaint
- update_complaint_status(): Change complaint status
- add_comment(): Add comment to complaint
- get_complaint_stats(): Get statistics
"""

from datetime import datetime
from sqlalchemy import func, or_
from backend.database import db
from backend.models.complaint import (
    Complaint,
    ComplaintCategory,
    ComplaintComment,
    ComplaintStatusHistory,
    generate_complaint_id
)
from backend.models.user import User


def get_all_categories():
    """
    Get all active complaint categories.
    
    Returns:
        list: List of category dictionaries
    """
    categories = ComplaintCategory.query.filter_by(is_active=True).all()
    return [cat.to_dict() for cat in categories]


def get_complaints(status=None, category_id=None, priority=None, hostel_block=None, 
                   student_id=None, assigned_to=None, limit=50, offset=0):
    """
    Get complaints with optional filters.
    
    Args:
        status (str): Filter by status
        category_id (int): Filter by category
        priority (str): Filter by priority
        hostel_block (str): Filter by hostel block
        student_id (int): Filter by student
        assigned_to (int): Filter by assigned staff
        limit (int): Number of results
        offset (int): Pagination offset
    
    Returns:
        dict: Complaints list with metadata
    """
    query = Complaint.query
    
    # Apply filters
    if status:
        query = query.filter_by(status=status)
    if category_id:
        query = query.filter_by(category_id=category_id)
    if priority:
        query = query.filter_by(priority=priority)
    if hostel_block:
        query = query.filter_by(hostel_block=hostel_block)
    if student_id:
        query = query.filter_by(student_id=student_id)
    if assigned_to:
        query = query.filter_by(assigned_to=assigned_to)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    complaints = query.order_by(Complaint.created_at.desc()).limit(limit).offset(offset).all()
    
    return {
        'complaints': [c.to_dict(include_relations=True) for c in complaints],
        'total': total,
        'limit': limit,
        'offset': offset
    }


def get_complaint_by_id(complaint_id):
    """
    Get single complaint by ID with full details.
    
    Args:
        complaint_id (str): Complaint ID (e.g., CMP-0001)
    
    Returns:
        dict: Complaint details with relations or None
    """
    complaint = Complaint.query.filter_by(complaint_id=complaint_id).first()
    
    if not complaint:
        return None
    
    # Get complaint data with relations
    data = complaint.to_dict(include_relations=True)
    
    # Add comments
    comments = ComplaintComment.query.filter_by(complaint_id=complaint.id).order_by(
        ComplaintComment.created_at.desc()
    ).all()
    data['comments'] = [c.to_dict(include_user=True) for c in comments]
    
    # Add status history
    history = ComplaintStatusHistory.query.filter_by(complaint_id=complaint.id).order_by(
        ComplaintStatusHistory.created_at.desc()
    ).all()
    data['status_history'] = [h.to_dict(include_user=True) for h in history]
    
    return data


def create_complaint(student_id, hostel_block, room_number, category_id, title, 
                    description, priority='medium'):
    """
    Create new complaint.
    
    Args:
        student_id (int): Student user ID
        hostel_block (str): Hostel block name
        room_number (str): Room number
        category_id (int): Complaint category ID
        title (str): Complaint title
        description (str): Detailed description
        priority (str): Priority level (low, medium, high, critical)
    
    Returns:
        dict: Created complaint data
    
    Raises:
        ValueError: If validation fails
    """
    # Validate student exists
    student = User.query.get(student_id)
    if not student:
        raise ValueError('Student not found')
    
    # Validate category exists
    if category_id:
        category = ComplaintCategory.query.get(category_id)
        if not category or not category.is_active:
            raise ValueError('Invalid category')
    
    # Validate priority
    valid_priorities = ['low', 'medium', 'high', 'critical']
    if priority not in valid_priorities:
        raise ValueError(f'Priority must be one of: {", ".join(valid_priorities)}')
    
    # Generate unique complaint ID
    complaint_id = generate_complaint_id()
    
    # Create complaint
    complaint = Complaint(
        complaint_id=complaint_id,
        student_id=student_id,
        hostel_block=hostel_block,
        room_number=room_number,
        category_id=category_id,
        title=title,
        description=description,
        priority=priority,
        status='open',
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.session.add(complaint)
    
    # Create initial status history
    status_history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        old_status=None,
        new_status='open',
        changed_by=student_id,
        notes='Complaint created',
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(status_history)
    
    db.session.commit()
    
    return complaint.to_dict(include_relations=True)


def update_complaint_status(complaint_id, new_status, changed_by, notes=None):
    """
    Update complaint status.
    
    Args:
        complaint_id (str): Complaint ID (e.g., CMP-0001)
        new_status (str): New status
        changed_by (int): User ID making the change
        notes (str): Optional notes about the change
    
    Returns:
        dict: Updated complaint data
    
    Raises:
        ValueError: If validation fails
    """
    complaint = Complaint.query.filter_by(complaint_id=complaint_id).first()
    if not complaint:
        raise ValueError('Complaint not found')
    
    # Validate status
    valid_statuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed']
    if new_status not in valid_statuses:
        raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
    
    # Validate user exists
    user = User.query.get(changed_by)
    if not user:
        raise ValueError('User not found')
    
    # Store old status
    old_status = complaint.status
    
    # Update complaint status
    complaint.status = new_status
    complaint.updated_at = datetime.utcnow()
    
    # If resolved, set resolved_at timestamp
    if new_status == 'resolved' and not complaint.resolved_at:
        complaint.resolved_at = datetime.utcnow()
    
    # Create status history entry
    status_history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        notes=notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(status_history)
    
    db.session.commit()
    
    return complaint.to_dict(include_relations=True)


def add_comment(complaint_id, user_id, comment_text, is_internal=False):
    """
    Add comment to complaint.
    
    Args:
        complaint_id (str): Complaint ID (e.g., CMP-0001)
        user_id (int): User ID posting comment
        comment_text (str): Comment content
        is_internal (bool): Internal staff note
    
    Returns:
        dict: Created comment data
    
    Raises:
        ValueError: If validation fails
    """
    complaint = Complaint.query.filter_by(complaint_id=complaint_id).first()
    if not complaint:
        raise ValueError('Complaint not found')
    
    # Validate user exists
    user = User.query.get(user_id)
    if not user:
        raise ValueError('User not found')
    
    # Validate comment text
    if not comment_text or not comment_text.strip():
        raise ValueError('Comment text is required')
    
    # Create comment
    comment = ComplaintComment(
        complaint_id=complaint.id,
        user_id=user_id,
        comment_text=comment_text.strip(),
        is_internal=is_internal,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.session.add(comment)
    
    # Update complaint updated_at
    complaint.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return comment.to_dict(include_user=True)


def get_complaint_stats():
    """
    Get complaint statistics.
    
    Returns:
        dict: Statistics about complaints
    """
    total = Complaint.query.count()
    open_count = Complaint.query.filter_by(status='open').count()
    assigned_count = Complaint.query.filter_by(status='assigned').count()
    in_progress_count = Complaint.query.filter_by(status='in_progress').count()
    resolved_count = Complaint.query.filter_by(status='resolved').count()
    closed_count = Complaint.query.filter_by(status='closed').count()
    
    # Count by priority
    low_priority = Complaint.query.filter_by(priority='low').count()
    medium_priority = Complaint.query.filter_by(priority='medium').count()
    high_priority = Complaint.query.filter_by(priority='high').count()
    critical_priority = Complaint.query.filter_by(priority='critical').count()
    
    # Count by category
    category_stats = db.session.query(
        ComplaintCategory.name,
        func.count(Complaint.id).label('count')
    ).outerjoin(Complaint).group_by(ComplaintCategory.name).all()
    
    categories = {cat: count for cat, count in category_stats}
    
    # Get recent complaints (last 7 days)
    from datetime import timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_count = Complaint.query.filter(Complaint.created_at >= week_ago).count()
    
    return {
        'total': total,
        'by_status': {
            'open': open_count,
            'assigned': assigned_count,
            'in_progress': in_progress_count,
            'resolved': resolved_count,
            'closed': closed_count
        },
        'by_priority': {
            'low': low_priority,
            'medium': medium_priority,
            'high': high_priority,
            'critical': critical_priority
        },
        'by_category': categories,
        'recent_7_days': recent_count,
        'resolution_rate': round((resolved_count / total * 100), 1) if total > 0 else 0
    }
