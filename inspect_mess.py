"""Quick inspection script for Mess Module"""
from backend.database import db
from backend.app import create_app
from backend.models.mess import MessMenu, MenuItem
from backend.models.user import User

app = create_app('development')
app.app_context().push()

print('='*50)
print('MESS MODULE INSPECTION REPORT')
print('='*50)

# 1. Weekly Timetable
print('\n1. WEEKLY TIMETABLE:')
menus = MessMenu.query.all()
print(f'   Total Menus: {len(menus)}')
days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner']
for day in days:
    day_menus = MessMenu.query.filter_by(day=day).all()
    meal_types = [m.meal_type for m in day_menus]
    print(f'   {day}: {", ".join(meal_types) if meal_types else "MISSING"}')

# 2. Menu Items
print('\n2. MENU ITEMS:')
items = MenuItem.query.all()
print(f'   Total Items: {len(items)}')
print(f'   Breakfast items: {len([i for i in items if i.menu.meal_type == "Breakfast"])}')
print(f'   Lunch items: {len([i for i in items if i.menu.meal_type == "Lunch"])}')
print(f'   Snacks items: {len([i for i in items if i.menu.meal_type == "Snacks"])}')
print(f'   Dinner items: {len([i for i in items if i.menu.meal_type == "Dinner"])}')

# 3. Sample Monday Breakfast
print('\n3. MONDAY BREAKFAST ITEMS:')
mon_breakfast = MessMenu.query.filter_by(day='Monday', meal_type='Breakfast').first()
if mon_breakfast:
    for item in mon_breakfast.items:
        print(f'   - {item.item_name}')
else:
    print('   MISSING')

# 4. Student Count
print('\n4. STUDENT COUNT:')
students = User.query.filter_by(role='student').count()
print(f'   Total Students: {students}')

# 5. Hostel Blocks
print('\n5. HOSTEL BLOCKS:')
print('   Checking User model for hostel_block field...')
user = User.query.first()
if user and hasattr(user, 'hostel_block'):
    print('   ✓ hostel_block field exists')
else:
    print('   ✗ hostel_block field NOT found in User model')

print('\n' + '='*50)
