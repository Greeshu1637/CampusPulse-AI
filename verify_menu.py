import sqlite3

# Connect to database
conn = sqlite3.connect('backend/instance/campuspulse_dev.db')
cursor = conn.cursor()

print("=" * 80)
print("COMPLETE WEEKLY MENU FROM DATABASE")
print("=" * 80)

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

for day in days:
    print(f"\n{'=' * 80}")
    print(f"{day.upper()}")
    print(f"{'=' * 80}")
    
    # Get menus for this day
    cursor.execute("""
        SELECT id, meal_type, time_start, time_end, estimated_servings
        FROM mess_menus 
        WHERE day = ? 
        ORDER BY 
            CASE meal_type
                WHEN 'Breakfast' THEN 1
                WHEN 'Lunch' THEN 2
                WHEN 'Snacks' THEN 3
                WHEN 'Dinner' THEN 4
            END
    """, (day,))
    
    menus = cursor.fetchall()
    
    if not menus:
        print(f"  No menus found for {day}")
        continue
    
    # Show each meal
    for menu_id, meal_type, time_start, time_end, servings in menus:
        print(f"\n{meal_type.upper()} ({time_start} - {time_end})")
        print(f"Estimated Servings: {servings}")
        print("-" * 80)
        
        # Get all menu items for this menu
        cursor.execute("""
            SELECT item_name, category, is_veg, calories, protein_g, carbs_g, fat_g
            FROM menu_items
            WHERE menu_id = ?
            ORDER BY category, item_name
        """, (menu_id,))
        
        items = cursor.fetchall()
        
        if not items:
            print("  No items found")
        else:
            current_category = None
            for item_name, category, is_veg, calories, protein, carbs, fat in items:
                if category != current_category:
                    current_category = category
                    print(f"\n  [{category}]")
                
                veg_symbol = "🟢" if is_veg else "🔴"
                print(f"    {veg_symbol} {item_name}")
                print(f"       Calories: {calories} | Protein: {protein}g | Carbs: {carbs}g | Fat: {fat}g")

print("\n" + "=" * 80)
print("VERIFICATION COMPLETE")
print("=" * 80)

conn.close()
