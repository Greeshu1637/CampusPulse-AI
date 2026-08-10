# Script to create the official seed file
seed_content = '''"""
CampusPulse AI - Official Girls Hostel Timetable Seeding
=========================================================

SINGLE SOURCE OF TRUTH: docs/timetable.md

Girls Hostel Details:
- Population: 4000 students
- Blocks: Main, Rudramadevi, Annapurna (AC), N Square, Galaxy, Elite, Delight
- Meal Timings: Breakfast (07:00-09:00), Lunch (12:00-14:00), Snacks (16:00-18:00), Dinner (20:00-22:00)

This file seeds the OFFICIAL weekly mess timetable.
NO demo/sample data. ONLY authentic Girls Hostel menu.
"""

from backend.database import db
from backend.models.mess import (
    MealTiming,
    MessMenu,
    MenuItem,
    FoodRating,
    FoodFeedback,
    MealAttendance
)
from backend.models.user import User
from datetime import datetime, date, timedelta
import random


def seed_meal_timings():
    """Seed official Girls Hostel meal timings"""
    print('🕐 Seeding meal timings...')
    
    timings = [
        {'meal_type': 'Breakfast', 'start_time': '07:00', 'end_time': '09:00'},
        {'meal_type': 'Lunch', 'start_time': '12:00', 'end_time': '14:00'},
        {'meal_type': 'Snacks', 'start_time': '16:00', 'end_time': '18:00'},
        {'meal_type': 'Dinner', 'start_time': '20:00', 'end_time': '22:00'},
    ]
    
    for timing_data in timings:
        existing = MealTiming.query.filter_by(meal_type=timing_data['meal_type']).first()
        if not existing:
            timing = MealTiming(**timing_data)
            db.session.add(timing)
    
    db.session.commit()
    print(f'  ✓ Added {len(timings)} meal timings')
'''

with open('backend/services/seed_smart_dining.py', 'w', encoding='utf-8') as f:
    f.write(seed_content)

print("Part 1 written")
