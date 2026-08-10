import sqlite3
import re

# Official Girls Hostel Timetable (Source of Truth)
OFFICIAL_TIMETABLE = {
    'Monday': {
        'Breakfast': ['Idly', 'Vada', 'Gara', 'Godhuma Rava Upma', 'Ragi Idly', 'G. Nut Chutney', 'Sambar', 'Milk', 'Coffee'],
        'Lunch': ['Egg Poratu', 'Bread Halwa', 'Bendakai Iguru', 'Omelets', 'Cabbage Curry', 'Dosakaya Pappu', 'Tomato Chutney', 'Sambar', 'Curd'],
        'Snacks': ['Punugulu', 'Mysore Bonda', 'Onion Pakodi', 'Chutney', 'Pulses', 'Tea', 'Milk'],
        'Dinner': ['Rice', 'Pulka', 'Pappu', 'Aloo Vellullikaram', 'Thotakura Fry', 'Nimakaya Pappucharu', 'Tomato Rasam', 'Mix Veg Chutney', 'Curd']
    },
    'Tuesday': {
        'Breakfast': ['Idly', 'Uthappam', 'Upma', 'Ragi Idly', 'Allam Chutney', 'Putnalu Chutney', 'Milk', 'Coffee'],
        'Lunch': ['Rice', 'Pulihora', 'Tomato Rice', 'Akukura Pappu', 'Vankay Iguru', 'Beetroot Curry', 'Sambar', 'Curd', 'Dosakai Mukkalu Chutney'],
        'Snacks': ['Veg Puff', 'Atukulupma', 'Cake', 'Bread Omelet', 'Green Batani', 'Tea', 'Milk'],
        'Dinner': ['Pulka', 'Saruva', 'E.F.R', 'V.F.R', 'Dondakai Curry', 'Perugupulusu', 'Melamaker + Gongura', 'Pesara Pappu Pappucharu', 'Rasam', 'Curd']
    },
    'Wednesday': {
        'Breakfast': ['Chapathi', 'Ragi Idly', 'Kurma', 'Idly', 'Chutney', 'Milk', 'Coffee'],
        'Lunch': ['Rice', 'Tomato Pappu', 'Goruchikkudu Iguru', 'Potlakai Perugu', 'Samabar', 'Aratikai Curry', 'Beetroot Chutney', 'Curd'],
        'Snacks': ['Sweet & Salt', 'Kharjura Biscuits', 'Badam Milk', 'Thapala Chekkalu', 'Tea', 'Milk'],
        'Dinner': ['Pulka', 'Palav', 'Veg Kurma', 'Raita', 'Gongura Chutney', 'Chicken Fry', 'Paneer Kurma', 'Beans Curry', 'Sweet', 'Rasam', 'Pappucharu', 'Curd']
    },
    'Thursday': {
        'Breakfast': ['Idly', 'Chitti Uthappam', 'Ragi Idly', 'Kattu Pongali', 'Idly Karam Podi', 'Palli Chutney', 'Milk', 'Sambar', 'Coffee'],
        'Lunch': ['Akukura Pappu', 'Dondakai', 'Bendakai', 'Cabbage', 'Tomato + Mulakai', 'Gummadikaya', 'Chama Dumpa Pulusu', 'Veg Chutney', 'Curd', 'Palakura Pappu', 'Sambar'],
        'Snacks': ['Chat', 'Panipoori', 'Fruit Salad', 'Ragijava', 'Milk', 'Tea'],
        'Dinner': ['Pulka', 'Plain Palak', 'Boiled Egg', 'Onion Curry', 'Onion Pulusu', 'Sweet', 'Fruit', 'G. Vankai Karam', 'Tomato Pappucharu', 'Rasam', 'Curd']
    },
    'Friday': {
        'Breakfast': ['Idly', 'Bread & Jam', 'Roasted Bread', 'Ragi Idly', 'Semya Upma', 'Putnalu Chutney', 'Alu Curry', 'Coffee', 'Milk'],
        'Lunch': ['Wheat', 'Gottalu', 'Papads', 'Dosakaya Pappu', 'Dondakai Iguru', 'Carrot Iguru', 'Red Chutney', 'Curd', 'Sambar'],
        'Snacks': ['V. Undalu', 'Jelebi', 'Boondi Laddu', 'Palli Undalu', 'Ashok Halwa', 'Thapala Chekkalu', 'Mixture', 'Cornflakes', 'Milk', 'Tea'],
        'Dinner': ['Pulka', 'Ragi Sankati', 'Rice', 'Chicken Curry', 'Mushroom Curry', 'Aloo Pachikaram', 'Sweet', 'Gongura Chutney', 'Pappucharu', 'Rasam', 'Curd']
    },
    'Saturday': {
        'Breakfast': ['Idly', 'Chapathi', 'Ragi Idly', 'Tomato Pappu', 'Curry', 'Milk', 'Chutney', 'Coffee'],
        'Lunch': ['French Fries', 'Alu 65', 'Bendakai Pulusu', 'Pachipappu + Mulakai Curry', 'Thotakura Pappu', 'Pudeena Chutney', 'Sambar', 'Curd'],
        'Snacks': ['Perugu Vada', 'Manchuria', 'Masala Vada', 'Mirchi Bajji', 'Ragi Java', 'Tea', 'Milk'],
        'Dinner': ['Pulka', 'Chenna Masala', 'Boiled Eggs', 'Onion Curry', 'Onion Pulusu', 'Vankai Curry', 'Pappucharu', 'Rasam', 'Palli Chutney', 'Fruit', 'Curd']
    },
    'Sunday': {
        'Breakfast': ['Masala Dosa', 'Plain Dosa', 'Upma', 'Ragi Idly', 'Poori', 'Alu Curry', 'Putnalu Chutney', 'Ginger Chutney', 'Coffee', 'Milk'],
        'Lunch': ['Mudda Pappu', 'Avakai', 'Kakarakai Iguru', 'Kakarakai Karam', 'Carrot Thurumu Curry', 'Pakodi Pulusu', 'Pachipulusu', 'Sambar'],
        'Snacks': ['Uggani', 'Masala Maramaralu', 'Cream Bun', 'Payasam', 'Senagalu Thalimpu', 'Tea', 'Milk'],
        'Dinner': ['Pulka', 'Palav', 'Veg Kurma', 'Chicken Curry', 'Raita', 'Kaju Kurma', 'Sweet', 'Gongura Chutney', 'Mullakai Tomato Curry', 'Pappucharu', 'Rasam', 'Curd']
    }
}

# Connect to database
conn = sqlite3.connect('backend/instance/campuspulse_dev.db')
cursor = conn.cursor()

# Get database menus
def get_db_items(day, meal_type):
    cursor.execute("""
        SELECT mi.item_name
        FROM mess_menus m
        JOIN menu_items mi ON m.id = mi.menu_id
        WHERE m.day = ? AND m.meal_type = ?
        ORDER BY mi.item_name
    """, (day, meal_type))
    return [row[0] for row in cursor.fetchall()]

def normalize_name(name):
    """Normalize item names for comparison"""
    return name.lower().strip().replace('  ', ' ')

def compare_items(official_items, db_items):
    """Compare official vs database items"""
    official_norm = {normalize_name(item): item for item in official_items}
    db_norm = {normalize_name(item): item for item in db_items}
    
    correct = []
    missing = []
    extra = []
    
    # Find matches
    for norm_name, orig_name in official_norm.items():
        if norm_name in db_norm:
            correct.append(orig_name)
        else:
            missing.append(orig_name)
    
    # Find extras
    for norm_name, orig_name in db_norm.items():
        if norm_name not in official_norm:
            extra.append(orig_name)
    
    return correct, missing, extra

def calculate_match_percentage(correct, total_official):
    """Calculate match percentage"""
    if total_official == 0:
        return 100.0
    return (len(correct) / total_official) * 100

# Generate Report
print("=" * 100)
print("GIRLS HOSTEL MESS TIMETABLE VERIFICATION REPORT")
print("=" * 100)
print("\nComparing: Official Timetable (docs/timetable.md) vs SQLite Database")
print("\nLegend:")
print("  ✅ Correct items (already matching)")
print("  ❌ Missing items (in timetable but NOT in database)")
print("  ➕ Extra items (in database but NOT in timetable)")
print("\n" + "=" * 100)

total_meals = 0
total_matches = 0
total_official_items = 0
meal_results = []

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner']

for day in days:
    print(f"\n{'=' * 100}")
    print(f"{day.upper()}")
    print(f"{'=' * 100}")
    
    for meal in meals:
        official_items = OFFICIAL_TIMETABLE[day][meal]
        db_items = get_db_items(day, meal)
        
        correct, missing, extra = compare_items(official_items, db_items)
        match_pct = calculate_match_percentage(correct, len(official_items))
        
        total_meals += 1
        total_matches += len(correct)
        total_official_items += len(official_items)
        
        meal_results.append({
            'day': day,
            'meal': meal,
            'match_pct': match_pct,
            'correct': len(correct),
            'missing': len(missing),
            'extra': len(extra),
            'total': len(official_items)
        })
        
        print(f"\n{meal.upper()}")
        print(f"Match: {match_pct:.1f}% ({len(correct)}/{len(official_items)} items)")
        print("-" * 100)
        
        if correct:
            print(f"\n✅ CORRECT ({len(correct)} items):")
            for item in sorted(correct):
                print(f"   • {item}")
        
        if missing:
            print(f"\n❌ MISSING ({len(missing)} items - in timetable but NOT in database):")
            for item in sorted(missing):
                print(f"   • {item}")
        
        if extra:
            print(f"\n➕ EXTRA ({len(extra)} items - in database but NOT in timetable):")
            for item in sorted(extra):
                print(f"   • {item}")

# Overall Summary
print("\n" + "=" * 100)
print("OVERALL SUMMARY")
print("=" * 100)

overall_match_pct = (total_matches / total_official_items) * 100 if total_official_items > 0 else 0

print(f"\nTotal Meals Analyzed: {total_meals} (7 days × 4 meals)")
print(f"Total Official Items: {total_official_items}")
print(f"Total Matched Items: {total_matches}")
print(f"Overall Match Percentage: {overall_match_pct:.1f}%")

# Best and worst matches
print("\n" + "-" * 100)
print("BEST MATCHES:")
print("-" * 100)
best_matches = sorted(meal_results, key=lambda x: x['match_pct'], reverse=True)[:5]
for result in best_matches:
    print(f"{result['day']:12} {result['meal']:12} {result['match_pct']:5.1f}%  ({result['correct']}/{result['total']} items)")

print("\n" + "-" * 100)
print("WORST MATCHES:")
print("-" * 100)
worst_matches = sorted(meal_results, key=lambda x: x['match_pct'])[:5]
for result in worst_matches:
    print(f"{result['day']:12} {result['meal']:12} {result['match_pct']:5.1f}%  ({result['correct']}/{result['total']} items)")

# Meal timing verification
print("\n" + "=" * 100)
print("MEAL TIMING VERIFICATION")
print("=" * 100)

cursor.execute("SELECT meal_type, start_time, end_time FROM meal_timings ORDER BY start_time")
db_timings = cursor.fetchall()

official_timings = {
    'Breakfast': ('07:00', '09:00'),
    'Lunch': ('12:00', '14:00'),
    'Snacks': ('16:00', '18:00'),
    'Dinner': ('20:00', '22:00')
}

print("\nMeal Type      Official Timing    Database Timing    Status")
print("-" * 100)
for meal, start, end in db_timings:
    official_start, official_end = official_timings.get(meal, ('', ''))
    status = "✅" if (start == official_start and end == official_end) else "❌"
    print(f"{meal:15} {official_start} - {official_end:8}    {start} - {end:8}    {status}")

print("\n" + "=" * 100)
print("VERIFICATION COMPLETE")
print("=" * 100)
print("\n⚠️  AWAITING USER APPROVAL BEFORE MAKING ANY DATABASE CHANGES")
print("=" * 100)

conn.close()
