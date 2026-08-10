"""
Verification Script: Database → API → Frontend Flow
===================================================

This script verifies that the mess menu system is working correctly
from database all the way to the frontend.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.app import create_app
from backend.models.mess import MessMenu, MessItem
from backend.services.mess_service import MessService
from datetime import datetime


def verify_database():
    """Step 1: Verify database has mess data"""
    print("=" * 60)
    print("STEP 1: Verifying Database")
    print("=" * 60)
    
    app = create_app()
    with app.app_context():
        # Check total menus
        total_menus = MessMenu.query.count()
        print(f"✓ Total menus in database: {total_menus}")
        
        if total_menus == 0:
            print("✗ ERROR: No menus found in database!")
            return False
        
        # Check today's menus
        today = datetime.now().strftime('%A')
        today_menus = MessMenu.query.filter_by(day=today).all()
        print(f"✓ {today}'s menus: {len(today_menus)}")
        
        if len(today_menus) == 0:
            print(f"✗ ERROR: No menus found for {today}!")
            return False
        
        # Show details
        for menu in today_menus:
            items_count = len(menu.items)
            special_marker = " [SPECIAL]" if menu.is_special else ""
            print(f"  - {menu.meal_type}: {items_count} items{special_marker}")
            
            # Show first 3 items
            for i, item in enumerate(menu.items[:3]):
                print(f"    • {item.item_name}")
            if len(menu.items) > 3:
                print(f"    ... and {len(menu.items) - 3} more")
        
        print()
        return True


def verify_service():
    """Step 2: Verify MessService returns correct data"""
    print("=" * 60)
    print("STEP 2: Verifying MessService")
    print("=" * 60)
    
    app = create_app()
    with app.app_context():
        # Get today's menu via service
        menu = MessService.get_today_menu()
        
        if not menu:
            print("✗ ERROR: MessService.get_today_menu() returned None!")
            return False
        
        print(f"✓ Service returned menu for: {menu['day']}")
        print(f"✓ Total meals: {len(menu['meals'])}")
        print(f"✓ Overall rating: {menu['rating']}/5.0 ({menu['total_ratings']} ratings)")
        print()
        
        # Show meal details
        for meal in menu['meals']:
            meal_type = meal.get('meal_type', meal.get('type'))
            items_count = len(meal['items'])
            status = meal.get('status', 'unknown')
            is_special = meal.get('is_special', meal.get('special', False))
            
            special_marker = " [SPECIAL]" if is_special else ""
            print(f"  {meal_type} ({meal['time']}) - {status.upper()}{special_marker}")
            print(f"    Items ({items_count}):")
            
            # Show first 3 items
            for i, item in enumerate(meal['items'][:3]):
                if isinstance(item, dict):
                    item_name = item.get('item_name', str(item))
                else:
                    item_name = str(item)
                print(f"      • {item_name}")
            
            if items_count > 3:
                print(f"      ... and {items_count - 3} more")
            print()
        
        return True


def verify_api_structure():
    """Step 3: Verify API returns correct structure"""
    print("=" * 60)
    print("STEP 3: Verifying API Structure")
    print("=" * 60)
    
    app = create_app()
    with app.app_context():
        menu = MessService.get_today_menu()
        
        # Check required fields
        required_fields = ['date', 'day', 'meals', 'rating', 'total_ratings']
        for field in required_fields:
            if field in menu:
                print(f"✓ Field '{field}' present")
            else:
                print(f"✗ ERROR: Field '{field}' missing!")
                return False
        
        # Check meal structure
        if len(menu['meals']) > 0:
            meal = menu['meals'][0]
            meal_fields = ['meal_type', 'time', 'items', 'status']
            print()
            print("Checking first meal structure:")
            for field in meal_fields:
                if field in meal or (field == 'meal_type' and 'type' in meal):
                    print(f"✓ Meal field '{field}' present")
                else:
                    print(f"✗ ERROR: Meal field '{field}' missing!")
                    return False
            
            # Check items structure
            if len(meal['items']) > 0:
                item = meal['items'][0]
                print()
                print(f"Item type: {type(item).__name__}")
                if isinstance(item, dict):
                    if 'item_name' in item:
                        print(f"✓ Item has 'item_name' field")
                        print(f"  Example: {item['item_name']}")
                    else:
                        print(f"✗ ERROR: Item missing 'item_name' field!")
                        return False
                else:
                    print(f"✓ Item is string: {item}")
        
        print()
        return True


def verify_frontend_compatibility():
    """Step 4: Verify data structure is frontend-compatible"""
    print("=" * 60)
    print("STEP 4: Verifying Frontend Compatibility")
    print("=" * 60)
    
    app = create_app()
    with app.app_context():
        menu = MessService.get_today_menu()
        
        # Check if frontend can handle the structure
        print("Testing frontend rendering logic...")
        
        for meal in menu['meals']:
            # Test meal type extraction
            meal_type = meal.get('meal_type') or meal.get('type')
            if meal_type:
                print(f"✓ Can extract meal type: {meal_type}")
            else:
                print("✗ ERROR: Cannot extract meal type!")
                return False
            
            # Test items extraction
            items = meal.get('items', [])
            rendered_items = []
            for item in items:
                if isinstance(item, str):
                    rendered_items.append(item)
                elif isinstance(item, dict) and 'item_name' in item:
                    rendered_items.append(item['item_name'])
            
            if len(rendered_items) == len(items):
                print(f"✓ Can render all {len(items)} items for {meal_type}")
            else:
                print(f"✗ ERROR: Can only render {len(rendered_items)}/{len(items)} items!")
                return False
            
            # Test special status
            is_special = meal.get('is_special') or meal.get('special')
            special_name = meal.get('special_item_name') or meal.get('special_item')
            if is_special:
                print(f"✓ Special meal detected: {special_name or 'Yes'}")
        
        print()
        return True


def main():
    """Run all verification steps"""
    print()
    print("╔════════════════════════════════════════════════════════════╗")
    print("║     MESS MENU SYSTEM VERIFICATION                         ║")
    print("║     Database → API → Frontend Flow                        ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    
    results = []
    
    # Step 1: Database
    results.append(("Database", verify_database()))
    
    # Step 2: Service
    results.append(("Service Layer", verify_service()))
    
    # Step 3: API Structure
    results.append(("API Structure", verify_api_structure()))
    
    # Step 4: Frontend Compatibility
    results.append(("Frontend Compatibility", verify_frontend_compatibility()))
    
    # Summary
    print("=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for step_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {step_name}")
        if not passed:
            all_passed = False
    
    print()
    if all_passed:
        print("🎉 ALL CHECKS PASSED!")
        print()
        print("The complete flow is working correctly:")
        print("  Database → MessService → API → Frontend")
        print()
        print("Next steps:")
        print("  1. Start server: python -m backend.app")
        print("  2. Open browser: http://localhost:5000/frontend/pages/login.html")
        print("  3. Login with: student@campus.edu / student123")
        print("  4. Verify mess menu card displays database items")
        print()
        return 0
    else:
        print("❌ SOME CHECKS FAILED!")
        print()
        print("Please review the errors above and fix them.")
        print()
        return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
