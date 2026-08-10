"""
Verify Weekly Menu UI displays real database data
"""

import requests

print("=" * 70)
print("WEEKLY MENU UI VERIFICATION")
print("=" * 70)

# Check API response
print("\n📡 Testing /api/dining/week API...")
response = requests.get('http://127.0.0.1:5000/api/dining/week')

if response.status_code == 200:
    data = response.json()
    print(f"✓ API Status: {response.status_code} OK")
    print(f"✓ Days returned: {len(data['week'])}")
    
    print("\n📋 WEEKLY MENU DATA FROM API:")
    print("-" * 70)
    
    for day_data in data['week']:
        day = day_data['day']
        meals = day_data['meals']
        
        print(f"\n{day}:")
        for meal in meals:
            meal_type = meal['meal_type']
            items = meal['items']
            
            # Show first 3 items
            first_three = items[:3]
            remaining = len(items) - 3
            
            items_text = ', '.join([item['item_name'] for item in first_three])
            if remaining > 0:
                items_text += f" +{remaining} more"
            
            print(f"  • {meal_type}: {items_text}")
    
    print("\n" + "=" * 70)
    print("✅ VERIFICATION CHECKLIST")
    print("=" * 70)
    
    # Check for official items
    all_items = []
    for day_data in data['week']:
        for meal in day_data['meals']:
            for item in meal['items']:
                all_items.append(item['item_name'])
    
    official_items = ['Idly', 'Vada', 'Ragi Idly', 'Pulihora', 'Vankay Iguru', 
                      'Gongura Chutney', 'Pappucharu', 'Chicken Fry']
    
    demo_items = ['Poha', 'Biryani', 'Pizza', 'Momos', 'Rajma Rice', 
                  'Paneer Tikka', 'Fish Curry', 'Bread Omelette']
    
    found_official = [item for item in official_items if item in all_items]
    found_demo = [item for item in demo_items if item in all_items]
    
    print(f"\n✓ Official items found: {len(found_official)}/{len(official_items)}")
    for item in found_official:
        print(f"  • {item}")
    
    if found_demo:
        print(f"\n❌ Demo items still present: {len(found_demo)}")
        for item in found_demo:
            print(f"  • {item}")
    else:
        print(f"\n✓ No demo items found in API (all removed)")
    
    print("\n" + "=" * 70)
    print("🌐 FRONTEND VERIFICATION")
    print("=" * 70)
    print("\nOpen http://127.0.0.1:5000/mess in browser")
    print("\nExpected UI:")
    print("1. Today's Menu should display real Friday menu")
    print("2. Weekly Menu should show Monday-Sunday cards")
    print("3. Each day should show real items from database")
    print("4. Format: 'Item1, Item2, Item3 +X more'")
    print("5. No Poha, Biryani, Pizza, Momos visible")
    print("\n✅ If the UI matches the API data above, the fix is complete!")
    
else:
    print(f"❌ API Error: Status {response.status_code}")

print("\n" + "=" * 70)
