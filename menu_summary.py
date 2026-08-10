import sqlite3

conn = sqlite3.connect('backend/instance/campuspulse_dev.db')
cursor = conn.cursor()

print("=" * 80)
print("DATABASE MENU SUMMARY")
print("=" * 80)

# Count statistics
cursor.execute("SELECT COUNT(*) FROM mess_menus")
total_menus = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM menu_items")
total_items = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(DISTINCT day) FROM mess_menus")
total_days = cursor.fetchone()[0]

print(f"\nTotal Menus: {total_menus}")
print(f"Total Menu Items: {total_items}")
print(f"Days Covered: {total_days}")

# Show meal timings
print("\n" + "=" * 80)
print("MEAL TIMINGS")
print("=" * 80)
cursor.execute("SELECT meal_type, start_time, end_time FROM meal_timings ORDER BY start_time")
for meal, start, end in cursor.fetchall():
    print(f"{meal:15} {start} - {end}")

# Show items per day and meal
print("\n" + "=" * 80)
print("ITEMS COUNT PER DAY AND MEAL")
print("=" * 80)

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
for day in days:
    print(f"\n{day}:")
    cursor.execute("""
        SELECT m.meal_type, COUNT(mi.id)
        FROM mess_menus m
        LEFT JOIN menu_items mi ON m.id = mi.menu_id
        WHERE m.day = ?
        GROUP BY m.meal_type
        ORDER BY 
            CASE m.meal_type
                WHEN 'Breakfast' THEN 1
                WHEN 'Lunch' THEN 2
                WHEN 'Snacks' THEN 3
                WHEN 'Dinner' THEN 4
            END
    """, (day,))
    
    for meal, count in cursor.fetchall():
        print(f"  {meal:12} {count} items")

# Show unique items
print("\n" + "=" * 80)
print("UNIQUE ITEM NAMES (Alphabetically)")
print("=" * 80)

cursor.execute("SELECT DISTINCT item_name FROM menu_items ORDER BY item_name")
unique_items = [row[0] for row in cursor.fetchall()]

for i, item in enumerate(unique_items, 1):
    print(f"{i:3}. {item}")

print(f"\nTotal Unique Items: {len(unique_items)}")

conn.close()
