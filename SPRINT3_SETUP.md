# Sprint 3 - Smart Dining Setup Guide

## Quick Start

### 1. Run Database Migration

```bash
# Navigate to project directory
cd C:\Users\Dell\OneDrive\Desktop\CampusPulse-AI-V2

# Activate virtual environment
.\venv\Scripts\activate

# Run migration to create Smart Dining tables
flask db upgrade
```

**What this creates:**
- `meal_menus` table
- `meal_feedbacks` table
- `meal_attendances` table  
- `meal_types` ENUM type

### 2. Start the Application

```bash
# Make sure you're in the project directory with venv activated
python run.py
```

### 3. Test Smart Dining Module

#### As a Student:
1. Visit: `http://localhost:5000/`
2. Click any role card (or select "Student")
3. Click "Smart Dining" in the sidebar
4. You'll see: "No menu available" (normal - no menu created yet)

#### As a Mess Manager:
1. Visit: `http://localhost:5000/`
2. Select "Mess Manager" role
3. Click "Smart Dining" in sidebar
4. Click "Create Menu" button
5. Fill in the form:
   - Date: Today's date
   - Meal Type: breakfast
   - Menu Items: Idli, Sambar, Chutney, Coffee
   - Description: South Indian breakfast
   - Calories: 350
6. Click "Save Menu"
7. Menu card appears!

#### Create Multiple Meals:
Repeat the above for:
- **Lunch**: Rice, Dal, Vegetable Curry, Curd
- **Snacks**: Tea, Samosa, Biscuits
- **Dinner**: Chapati, Paneer, Dal, Salad

#### Test Student Features:
1. Go back to login → Select "Student"
2. Go to Smart Dining
3. Now you'll see all the menus!
4. Click "Mark Taken" on any meal
5. Click "Rate Meal" and submit feedback
6. Scroll down to see your meal history

#### Test Analytics:
1. Go back to login → Select "Mess Manager"
2. Click "Analytics" in sidebar
3. View statistics and charts
4. Click "Export CSV" to download report

---

## Troubleshooting

### Migration Error: "relation already exists"
```bash
# Check current migration status
flask db current

# If needed, stamp the current version
flask db stamp head
```

### Can't see menus?
- Make sure you created a menu for TODAY'S date
- Check the meal_type is valid (breakfast, lunch, snacks, dinner)

### Charts not showing?
- Open browser console (F12) for errors
- Verify Chart.js CDN is loading
- Check if analytics API returns data

### PostgreSQL Connection Error?
- Verify PostgreSQL is running
- Check `.env` file has correct DATABASE_URL
- Test connection: `psql -U postgres -d campuspulse_ai`

---

## Database Verification

```sql
-- Check if tables were created
\dt

-- View meal menus
SELECT * FROM meal_menus;

-- View feedbacks
SELECT * FROM meal_feedbacks;

-- View attendances
SELECT * FROM meal_attendances;

-- Check ENUM type
\dT+ meal_types
```

---

## API Testing with cURL

### Create Menu
```bash
curl -X POST http://localhost:5000/dining/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "meal_type": "breakfast",
    "meal_date": "2026-07-31",
    "menu_items": "Idli, Sambar, Chutney",
    "description": "South Indian breakfast",
    "calories": 350
  }'
```

### Get Today's Menu
```bash
curl http://localhost:5000/dining/api/menu/today
```

### Submit Feedback
```bash
curl -X POST http://localhost:5000/dining/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "meal_menu_id": 1,
    "rating": 5,
    "feedback_text": "Excellent!"
  }'
```

### Mark Attendance
```bash
curl -X POST http://localhost:5000/dining/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "meal_menu_id": 1
  }'
```

### Get Analytics
```bash
curl http://localhost:5000/dining/api/analytics?days=7
```

---

## File Checklist

Verify these files exist:

### Backend
- [x] `campuspulse/models.py`
- [x] `campuspulse/services/dining_service.py`
- [x] `campuspulse/blueprints/dining/__init__.py`
- [x] `campuspulse/blueprints/dining/routes.py`
- [x] `migrations/versions/48ad9672e689_add_smart_dining_models.py`

### Frontend Templates
- [x] `campuspulse/templates/dining/student.html`
- [x] `campuspulse/templates/dining/manager.html`
- [x] `campuspulse/templates/dining/analytics.html`

### CSS
- [x] `campuspulse/static/css/dining.css`

### JavaScript
- [x] `campuspulse/static/js/dining_student.js`
- [x] `campuspulse/static/js/dining_manager.js`
- [x] `campuspulse/static/js/dining_analytics.js`

---

## Quick Demo Data

After migration, you can manually insert test data:

```sql
-- Insert a test user (if not exists)
INSERT INTO users (google_id, email, name, role, is_active)
VALUES ('test123', 'test@example.com', 'Test User', 'student', true)
ON CONFLICT DO NOTHING;

-- Insert test menus
INSERT INTO meal_menus (meal_type, meal_date, menu_items, description, calories)
VALUES 
  ('breakfast', CURRENT_DATE, 'Idli, Sambar, Chutney, Coffee', 'South Indian breakfast', 350),
  ('lunch', CURRENT_DATE, 'Rice, Dal, Vegetable Curry, Curd', 'North Indian lunch', 550),
  ('snacks', CURRENT_DATE, 'Tea, Samosa, Biscuits', 'Evening snacks', 250),
  ('dinner', CURRENT_DATE, 'Chapati, Paneer, Dal, Salad', 'Healthy dinner', 450);
```

---

## Success Indicators

✅ Migration runs without errors  
✅ 3 new tables visible in PostgreSQL  
✅ Smart Dining link works in sidebar  
✅ Can create menus as mess manager  
✅ Can view menus as student  
✅ Can mark attendance  
✅ Can submit feedback  
✅ Analytics page shows charts  
✅ CSV export downloads file  
✅ Theme switching works  
✅ Mobile responsive design works

---

## Next Steps

1. Run the migration
2. Start the app
3. Create test menus
4. Test all features
5. Report any issues

For detailed documentation, see `SPRINT3_COMPLETE.md`
