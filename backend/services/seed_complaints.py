"""
Complaint Categories and Sample Data Seeding
Source: Phase 1 & Phase 2 Implementation
"""

from backend.database import db
from backend.models.complaint import ComplaintCategory, Complaint, ComplaintStatusHistory, generate_complaint_id
from backend.models.user import User
from datetime import datetime, timedelta


def seed_complaint_categories():
    """Seeds official complaint categories for Girls Hostel"""
    
    print("\n" + "=" * 60)
    print("SEEDING COMPLAINT CATEGORIES")
    print("=" * 60)
    
    # Delete ALL existing categories
    print("\n🗑️  Deleting existing categories...")
    ComplaintCategory.query.delete()
    db.session.commit()
    print("✓ Deleted existing categories")
    
    # Official complaint categories
    categories = [
        {
            'name': 'Electrical',
            'icon': 'fa-bolt',
            'color': '#F59E0B',
            'description': 'Electrical issues, power outages, socket problems'
        },
        {
            'name': 'Plumbing',
            'icon': 'fa-droplet',
            'color': '#3B82F6',
            'description': 'Water leakage, drainage issues, tap problems'
        },
        {
            'name': 'WiFi',
            'icon': 'fa-wifi',
            'color': '#6C63FF',
            'description': 'Internet connectivity, WiFi signal issues'
        },
        {
            'name': 'Cleaning',
            'icon': 'fa-broom',
            'color': '#10B981',
            'description': 'Room cleaning, common area maintenance'
        },
        {
            'name': 'Food Quality',
            'icon': 'fa-utensils',
            'color': '#EF4444',
            'description': 'Mess food quality, hygiene concerns'
        },
        {
            'name': 'Water',
            'icon': 'fa-faucet',
            'color': '#06B6D4',
            'description': 'Water supply issues, hot water problems'
        },
        {
            'name': 'Furniture',
            'icon': 'fa-couch',
            'color': '#8B5CF6',
            'description': 'Broken furniture, bed issues, chair problems'
        },
        {
            'name': 'Security',
            'icon': 'fa-shield-halved',
            'color': '#DC2626',
            'description': 'Security concerns, safety issues'
        },
        {
            'name': 'Other',
            'icon': 'fa-circle-question',
            'color': '#6B7280',
            'description': 'Other complaints not covered above'
        }
    ]
    
    print("\n📝 Creating complaint categories...")
    
    category_count = 0
    for cat_data in categories:
        category = ComplaintCategory(
            name=cat_data['name'],
            icon=cat_data['icon'],
            color=cat_data['color'],
            description=cat_data['description'],
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(category)
        category_count += 1
    
    db.session.commit()
    
    print(f"✓ Created {category_count} complaint categories")


def seed_sample_complaints():
    """Seeds 8 realistic hostel complaints"""
    
    print("\n" + "=" * 60)
    print("SEEDING SAMPLE COMPLAINTS")
    print("=" * 60)
    
    # Delete existing complaints
    print("\n🗑️  Deleting existing complaints...")
    Complaint.query.delete()
    ComplaintStatusHistory.query.delete()
    db.session.commit()
    print("✓ Deleted existing complaints")
    
    # Get first student (for testing)
    student = User.query.filter_by(role='student').first()
    if not student:
        print("⚠️  No student found, skipping complaint seeding")
        return
    
    # Get categories
    categories = {cat.name: cat.id for cat in ComplaintCategory.query.all()}
    
    # Sample complaints
    complaints_data = [
        {
            'hostel_block': 'Main Block',
            'room_number': '404',
            'category': 'Plumbing',
            'title': 'Water Leakage in Bathroom',
            'description': 'Severe water leakage from bathroom ceiling near the shower area. Water is dripping continuously and has created a puddle on the floor. This started yesterday evening.',
            'priority': 'high',
            'status': 'in_progress',
            'days_ago': 0
        },
        {
            'hostel_block': 'Rudramadevi',
            'room_number': '305',
            'category': 'WiFi',
            'title': 'Poor WiFi Signal Strength',
            'description': 'WiFi connection is very weak in room 305. Signal keeps dropping every 10-15 minutes. Unable to attend online classes properly.',
            'priority': 'medium',
            'status': 'open',
            'days_ago': 1
        },
        {
            'hostel_block': 'Annapurna AC',
            'room_number': '207',
            'category': 'Electrical',
            'title': 'Ceiling Fan Not Working',
            'description': 'The ceiling fan in room 207 stopped working since morning. The regulator seems fine but the fan is not responding at all.',
            'priority': 'medium',
            'status': 'assigned',
            'days_ago': 1
        },
        {
            'hostel_block': 'N Square',
            'room_number': None,
            'category': 'Food Quality',
            'title': 'Undercooked Rice in Lunch',
            'description': 'Today\'s lunch rice was undercooked and hard. Multiple students complained about the same issue. Quality control needed.',
            'priority': 'medium',
            'status': 'resolved',
            'days_ago': 2
        },
        {
            'hostel_block': 'Galaxy',
            'room_number': '512',
            'category': 'Cleaning',
            'title': 'Room Not Cleaned for 3 Days',
            'description': 'The cleaning staff has not cleaned our room for the past 3 days. Trash is piling up and floor needs mopping urgently.',
            'priority': 'low',
            'status': 'open',
            'days_ago': 0
        },
        {
            'hostel_block': 'Elite',
            'room_number': '601',
            'category': 'Water',
            'title': 'No Hot Water Supply',
            'description': 'Hot water geyser in bathroom is not working. Only cold water is coming out. This issue started this morning.',
            'priority': 'high',
            'status': 'open',
            'days_ago': 0
        },
        {
            'hostel_block': 'Delight',
            'room_number': '408',
            'category': 'Furniture',
            'title': 'Broken Study Chair',
            'description': 'Study chair leg is broken and it\'s wobbling. Not safe to sit on. Need replacement or repair urgently.',
            'priority': 'medium',
            'status': 'in_progress',
            'days_ago': 3
        },
        {
            'hostel_block': 'Main Block',
            'room_number': '104',
            'category': 'Electrical',
            'title': 'Power Socket Not Working',
            'description': 'One of the two power sockets near the study table is not working. Can\'t charge laptop and phone simultaneously.',
            'priority': 'low',
            'status': 'resolved',
            'days_ago': 5
        }
    ]
    
    print("\n📝 Creating sample complaints...")
    
    for idx, complaint_data in enumerate(complaints_data, 1):
        # Generate complaint ID
        complaint_id = f'CMP-{idx:04d}'
        
        # Calculate created_at date
        created_at = datetime.utcnow() - timedelta(days=complaint_data['days_ago'])
        
        # Create complaint
        complaint = Complaint(
            complaint_id=complaint_id,
            student_id=student.id,
            hostel_block=complaint_data['hostel_block'],
            room_number=complaint_data['room_number'],
            category_id=categories.get(complaint_data['category']),
            title=complaint_data['title'],
            description=complaint_data['description'],
            priority=complaint_data['priority'],
            status=complaint_data['status'],
            resolved_at=created_at + timedelta(hours=2) if complaint_data['status'] == 'resolved' else None,
            created_at=created_at,
            updated_at=created_at
        )
        db.session.add(complaint)
        db.session.flush()
        
        # Create initial status history
        status_history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            old_status=None,
            new_status='open',
            changed_by=student.id,
            notes='Complaint created',
            created_at=created_at,
            updated_at=created_at
        )
        db.session.add(status_history)
        
        # Add status history for non-open complaints
        if complaint_data['status'] != 'open':
            status_history2 = ComplaintStatusHistory(
                complaint_id=complaint.id,
                old_status='open',
                new_status=complaint_data['status'],
                changed_by=student.id,
                notes=f'Status changed to {complaint_data["status"]}',
                created_at=created_at + timedelta(minutes=30),
                updated_at=created_at + timedelta(minutes=30)
            )
            db.session.add(status_history2)
    
    db.session.commit()
    
    print(f"✓ Created {len(complaints_data)} sample complaints")
    print("\n" + "=" * 60)
    print("✅ COMPLAINT DATA SEEDED SUCCESSFULLY!")
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"  • Categories: 9")
    print(f"  • Sample Complaints: {len(complaints_data)}")
    print(f"  • All categories active")
    print(f"  • Ready for API testing")
