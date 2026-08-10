"""
CampusPulse AI - Complaints Routes
===================================

RESTful API endpoints for complaint management.

Endpoints:
- GET    /api/complaints/categories - Get all categories
- GET    /api/complaints - Get all complaints (with filters)
- GET    /api/complaints/<id> - Get single complaint
- POST   /api/complaints - Create new complaint
- PUT    /api/complaints/<id>/status - Update complaint status
- POST   /api/complaints/<id>/comment - Add comment to complaint
- GET    /api/complaints/stats - Get statistics
"""

from flask import Blueprint, request, jsonify
from backend.services import complaints_service


# Create complaints blueprint
complaints_bp = Blueprint('complaints', __name__, url_prefix='/api/complaints')


@complaints_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Get all complaint categories.
    
    GET /api/complaints/categories
    
    Returns:
        200: List of categories
        500: Server error
    """
    try:
        categories = complaints_service.get_all_categories()
        
        return jsonify({
            'success': True,
            'categories': categories,
            'count': len(categories)
        }), 200
        
    except Exception as e:
        print(f'Get categories error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load categories',
            'error': str(e)
        }), 500


@complaints_bp.route('', methods=['GET'])
def get_complaints():
    """
    Get complaints with optional filters.
    
    GET /api/complaints?status=open&category_id=1&priority=high
    
    Query Parameters:
        status (str): Filter by status
        category_id (int): Filter by category
        priority (str): Filter by priority
        hostel_block (str): Filter by hostel block
        student_id (int): Filter by student
        assigned_to (int): Filter by assigned staff
        limit (int): Results per page (default: 50)
        offset (int): Pagination offset (default: 0)
    
    Returns:
        200: List of complaints
        500: Server error
    """
    try:
        # Get query parameters
        status = request.args.get('status')
        category_id = request.args.get('category_id', type=int)
        priority = request.args.get('priority')
        hostel_block = request.args.get('hostel_block')
        student_id = request.args.get('student_id', type=int)
        assigned_to = request.args.get('assigned_to', type=int)
        limit = request.args.get('limit', type=int, default=50)
        offset = request.args.get('offset', type=int, default=0)
        
        result = complaints_service.get_complaints(
            status=status,
            category_id=category_id,
            priority=priority,
            hostel_block=hostel_block,
            student_id=student_id,
            assigned_to=assigned_to,
            limit=limit,
            offset=offset
        )
        
        return jsonify({
            'success': True,
            **result
        }), 200
        
    except Exception as e:
        print(f'Get complaints error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load complaints',
            'error': str(e)
        }), 500


@complaints_bp.route('/<complaint_id>', methods=['GET'])
def get_complaint(complaint_id):
    """
    Get single complaint by ID.
    
    GET /api/complaints/CMP-0001
    
    Args:
        complaint_id (str): Complaint ID
    
    Returns:
        200: Complaint details
        404: Complaint not found
        500: Server error
    """
    try:
        complaint = complaints_service.get_complaint_by_id(complaint_id)
        
        if not complaint:
            return jsonify({
                'success': False,
                'message': f'Complaint {complaint_id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'complaint': complaint
        }), 200
        
    except Exception as e:
        print(f'Get complaint error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load complaint',
            'error': str(e)
        }), 500


@complaints_bp.route('', methods=['POST'])
def create_complaint():
    """
    Create new complaint.
    
    POST /api/complaints
    
    Request Body:
        {
            "student_id": 1,
            "hostel_block": "Main Block",
            "room_number": "404",
            "category_id": 1,
            "title": "Water leakage in bathroom",
            "description": "Severe water leakage from ceiling",
            "priority": "high"
        }
    
    Returns:
        201: Complaint created
        400: Validation error
        500: Server error
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['student_id', 'hostel_block', 'title', 'description']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Create complaint
        complaint = complaints_service.create_complaint(
            student_id=data['student_id'],
            hostel_block=data['hostel_block'],
            room_number=data.get('room_number'),
            category_id=data.get('category_id'),
            title=data['title'],
            description=data['description'],
            priority=data.get('priority', 'medium')
        )
        
        return jsonify({
            'success': True,
            'message': 'Complaint created successfully',
            'complaint': complaint
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
        
    except Exception as e:
        print(f'Create complaint error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to create complaint',
            'error': str(e)
        }), 500


@complaints_bp.route('/<complaint_id>/status', methods=['PUT'])
def update_status(complaint_id):
    """
    Update complaint status.
    
    PUT /api/complaints/CMP-0001/status
    
    Request Body:
        {
            "status": "in_progress",
            "changed_by": 2,
            "notes": "Assigned to maintenance team"
        }
    
    Args:
        complaint_id (str): Complaint ID
    
    Returns:
        200: Status updated
        400: Validation error
        404: Complaint not found
        500: Server error
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'status' not in data or 'changed_by' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: status, changed_by'
            }), 400
        
        # Update status
        complaint = complaints_service.update_complaint_status(
            complaint_id=complaint_id,
            new_status=data['status'],
            changed_by=data['changed_by'],
            notes=data.get('notes')
        )
        
        return jsonify({
            'success': True,
            'message': 'Complaint status updated successfully',
            'complaint': complaint
        }), 200
        
    except ValueError as e:
        error_msg = str(e)
        if 'not found' in error_msg.lower():
            return jsonify({
                'success': False,
                'message': error_msg
            }), 404
        else:
            return jsonify({
                'success': False,
                'message': error_msg
            }), 400
        
    except Exception as e:
        print(f'Update status error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to update complaint status',
            'error': str(e)
        }), 500


@complaints_bp.route('/<complaint_id>/comment', methods=['POST'])
def add_comment(complaint_id):
    """
    Add comment to complaint.
    
    POST /api/complaints/CMP-0001/comment
    
    Request Body:
        {
            "user_id": 2,
            "comment_text": "Working on this issue",
            "is_internal": false
        }
    
    Args:
        complaint_id (str): Complaint ID
    
    Returns:
        201: Comment added
        400: Validation error
        404: Complaint not found
        500: Server error
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'user_id' not in data or 'comment_text' not in data:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: user_id, comment_text'
            }), 400
        
        # Add comment
        comment = complaints_service.add_comment(
            complaint_id=complaint_id,
            user_id=data['user_id'],
            comment_text=data['comment_text'],
            is_internal=data.get('is_internal', False)
        )
        
        return jsonify({
            'success': True,
            'message': 'Comment added successfully',
            'comment': comment
        }), 201
        
    except ValueError as e:
        error_msg = str(e)
        if 'not found' in error_msg.lower():
            return jsonify({
                'success': False,
                'message': error_msg
            }), 404
        else:
            return jsonify({
                'success': False,
                'message': error_msg
            }), 400
        
    except Exception as e:
        print(f'Add comment error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to add comment',
            'error': str(e)
        }), 500


@complaints_bp.route('/stats', methods=['GET'])
def get_stats():
    """
    Get complaint statistics.
    
    GET /api/complaints/stats
    
    Returns:
        200: Statistics
        500: Server error
    """
    try:
        stats = complaints_service.get_complaint_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        print(f'Get stats error: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Failed to load statistics',
            'error': str(e)
        }), 500
