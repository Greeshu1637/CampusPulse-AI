"""
Compare Database Timetable with User's Original Timetable
NO CODE MODIFICATIONS - COMPARISON ONLY
"""

from backend.database import db
from backend.app import create_app
from backend.models.mess import MessMenu, MenuItem

app = create_app('development')
app.app_context().push()

print('='*80)
print('TIMETABLE COMPARISON REPORT')
print('Database vs User Original Timetable')
print('='*80)

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner']

total_items_db = 0
total_items_expected = 0
matched_items = 0
missing_items = []
extra_items = []

# Expected timetable (from user's original requirements)
# NOTE: I don't have the user's EXACT original timetable in the conversation history
# The seed file shows what's CURRENTLY in the database
# This script will extract what's IN the database and show it clearly

print('\n' + '='*80)
print('DATABASE CONTENTS (What is currently stored):')
print('='*80)

for day in days:
    print(f'\n📅 {day.upper()}')
    print('-' * 80)
    
    for meal in meals:
        menu = MessMenu.query.filter_by(day=day, meal_type=meal).first()
        
        if menu:
            items = [item.item_name for item in menu.items]
            total_items_db += len(items)
            
            print(f'\n  🍽️  {meal} ({menu.time_start} - {menu.time_end})')
            print(f'     Items ({len(items)}):')
            for item in items:
                print(f'       • {item}')
            
            if menu.is_special:
                print(f'     ⭐ SPECIAL: {menu.special_item_name}')
        else:
            print(f'\n  🍽️  {meal} - ❌ NOT FOUND IN DATABASE')

print('\n' + '='*80)
print('SUMMARY')
print('='*80)
print(f'Total items in database: {total_items_db}')
print(f'\nNote: This shows what is CURRENTLY in the database.')
print(f'The seed file contains sample/demo timetable data.')
print(f'\nTo compare with YOUR original timetable, please provide:')
print(f'  1. Your original weekly mess timetable document')
print(f'  2. Expected items for each meal')
print(f'  3. Special meals or festival menus')
print(f'\nWithout your original timetable, I cannot determine if this')
print(f'matches your hostel\'s actual data or is sample data.')
print('='*80)
