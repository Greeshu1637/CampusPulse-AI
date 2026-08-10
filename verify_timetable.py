import sqlite3

conn = sqlite3.connect('backend/instance/campuspulse_dev.db')
cursor = conn.cursor()

print("=" * 60)
print("DATABASE VERIFICATION")
print("=" * 60)

cursor.execute("SELECT COUNT(*) FROM mess_menus")
menu_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM menu_items")
item_count = cursor.fetchone()[0]

print(f"\nMenus: {menu_count}")
print(f"Items: {item_count}")

# Check Thursday items (today)
print("\nThursday's Menu:")
cursor.execute("""
    SELECT m.meal_type, COUNT(i.id) as item_count
    FROM mess_menus m
    LEFT JOIN menu_items i ON m.id = i.menu_id
    WHERE m.day = 'Thursday'
    GROUP BY m.meal_type
    ORDER BY 
        CASE m.meal_type
            WHEN 'Breakfast' THEN 1
            WHEN 'Lunch' THEN 2
            WHEN 'Snacks' THEN 3
            WHEN 'Dinner' THEN 4
        END
""")

for meal_type, count in cursor.fetchall():
    print(f"  {meal_type}: {count} items")

# Sample items from each meal
print("\nSample Items (Thursday Breakfast):")
cursor.execute("""
    SELECT i.item_name
    FROM menu_items i
    JOIN mess_menus m ON i.menu_id = m.id
    WHERE m.day = 'Thursday' AND m.meal_type = 'Breakfast'
    LIMIT 5
""")

for (item_name,) in cursor.fetchall():
    print(f"  - {item_name}")

# Check for demo items
print("\nChecking for demo items...")
demo_items = ['Dal Tadka', 'Mixed Veg Curry', 'Paneer Butter Masala', 'Special Sweet', 'Veg Biryani']
cursor.execute(f"SELECT item_name FROM menu_items WHERE item_name IN ({','.join(['?']*len(demo_items))})", demo_items)
found_demo = cursor.fetchall()

if found_demo:
    print(f"  WARNING: Found {len(found_demo)} demo items!")
    for (item,) in found_demo:
        print(f"    - {item}")
else:
    print("  ✓ No demo items found!")

# Check for official items
print("\nChecking for official items...")
official_items = ['Idly', 'Vada', 'Ragi Idly', 'Pulihora', 'Vankay Iguru', 'Gongura Chutney', 'Pappucharu']
cursor.execute(f"SELECT item_name FROM menu_items WHERE item_name IN ({','.join(['?']*len(official_items))})", official_items)
found_official = cursor.fetchall()

if found_official:
    print(f"  ✓ Found {len(found_official)} official items!")
    for (item,) in found_official:
        print(f"    - {item}")
else:
    print("  WARNING: No official items found!")

conn.close()

print("\n" + "=" * 60)
