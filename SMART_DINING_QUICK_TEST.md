# Smart Dining Module - Quick Test Guide 🧪

**Quick 5-minute test to verify everything works**

---

## 🚀 Start the Server

```bash
# From project root
python backend/app.py
```

**Expected Output:**
```
✓ Database tables created
✓ Database seeded with 4 test users
✓ Smart Dining data seeded successfully
  - 28 menus created (4 meals × 7 days)
  - 140 menu items created
  - 4 meal timings configured
```

Server should start on: `http://localhost:5000`

---

## 📡 Test APIs (Copy-Paste Commands)

### **1. Health Checks** ✅

Test all services are running:

```bash
# Main app health
curl http://localhost:5000/health

# Student API health
curl http://localhost:5000/api/dining/health

# Manager API health
curl http://localhost:5000/api/manager/health

# Admin API health
curl http://localhost:5000/api/admin/health
```

**Expected:** All should return `{"success": true, "status": "operational"}`

---

### **2. Student APIs** 👨‍🎓

#### Get Today's Menu
```bash
curl http://localhost:5000/api/dining/today
```

**Expected:** JSON with 4 meals (Breakfast, Lunch, Snacks, Dinner) with items, ratings, and status

#### Get Weekly Menu
```bash
curl http://localhost:5000/api/dining/week
```

**Expected:** JSON with 7 days × 4 meals = 28 menus

#### Search for "Idli"
```bash
curl "http://localhost:5000/api/dining/search?q=idli"
```

**Expected:** JSON with search results containing "Idli"

#### Search Vegetarian Food
```bash
curl "http://localhost:5000/api/dining/search?is_veg=true"
```

**Expected:** JSON with all vegetarian items

#### Get AI Recommendations
```bash
curl http://localhost:5000/api/dining/recommendations
```

**Expected:** JSON with personalized recommendations (top rated, popular veg, balanced meal tips)

#### Ask AI "What's today's breakfast?"
```bash
curl -X POST http://localhost:5000/api/dining/ask \
  -H "Content-Type: application/json" \
  -d "{\"question\": \"What's today's breakfast?\"}"
```

**Expected:** Natural language answer with today's breakfast items

---

### **3. Manager APIs** 👔

#### Get Manager Dashboard Stats
```bash
curl http://localhost:5000/api/manager/dashboard
```

**Expected:** JSON with KPIs (today's attendance, avg rating, active feedback, total menus, popular items)

#### Get All Menus
```bash
curl http://localhost:5000/api/manager/menus
```

**Expected:** JSON with all 28 menus

#### Get Monday's Menus
```bash
curl "http://localhost:5000/api/manager/menus?day=Monday"
```

**Expected:** JSON with 4 Monday menus (Breakfast, Lunch, Snacks, Dinner)

#### Get Breakfast Menus
```bash
curl "http://localhost:5000/api/manager/menus?meal_type=Breakfast"
```

**Expected:** JSON with 7 breakfast menus (one per day)

#### Get All Ratings
```bash
curl http://localhost:5000/api/manager/ratings
```

**Expected:** JSON with list of ratings (if any exist in DB)

#### Get All Feedback
```bash
curl http://localhost:5000/api/manager/feedback
```

**Expected:** JSON with list of feedback (if any exist in DB)

---

### **4. Admin APIs** 👑

#### Get Admin Dashboard
```bash
curl http://localhost:5000/api/admin/dashboard
```

**Expected:** Comprehensive JSON with:
- Key metrics (attendance, ratings, waste)
- Attendance trend (last 7 days)
- Rating trend
- Popular foods
- Unpopular foods
- Meal distribution

#### Get Attendance Report
```bash
curl "http://localhost:5000/api/admin/attendance?start_date=2026-07-01&end_date=2026-07-31"
```

**Expected:** JSON attendance report for July 2026

#### Get Rating Report
```bash
curl http://localhost:5000/api/admin/ratings
```

**Expected:** JSON with rating statistics (avg, distribution, by meal type)

#### Get Food Popularity Report
```bash
curl http://localhost:5000/api/admin/popularity
```

**Expected:** JSON with popular items, unpopular items, and all items with ratings

#### Get Nutritional Report
```bash
curl http://localhost:5000/api/admin/nutrition
```

**Expected:** JSON with average calories, protein, carbs, fat by meal type

#### Export Comprehensive Report
```bash
curl http://localhost:5000/api/admin/export
```

**Expected:** Large JSON with all analytics combined

---

## 🌐 Test Frontend (Browser)

### **1. Open Main Dashboard**
```
http://localhost:5000/
```

### **2. Navigate to Smart Dining**
```
http://localhost:5000/pages/mess.html
```

Or click "Smart Dining" in the sidebar

### **3. Test UI Features**

#### Theme Toggle
- Click sun/moon icon in topbar
- Should switch between light and dark mode
- Setting saved to localStorage

#### Sidebar
- Click hamburger menu (mobile) or chevron (desktop)
- Sidebar should collapse/expand
- State saved to localStorage

#### Search
- Type in search box (e.g., "idli")
- Menu items should filter in real-time
- Debounced (300ms delay)

#### View Switcher
- Click "Student" / "Manager" buttons
- Should switch between student and manager views
- Manager view shows "Update Menu" button

#### Notifications
- Click bell icon
- Notification panel should slide out
- Click outside to close

#### Profile Dropdown
- Click profile area
- Dropdown should appear
- Click outside to close

---

## 🗄️ Test Database (SQLite)

### **Check Tables Created**

```bash
# Open SQLite
sqlite3 backend/instance/campuspulse_dev.db

# List all tables
.tables

# Should show:
# meal_timings, mess_menus, menu_items, food_ratings, food_feedback, meal_attendance, users
```

### **Check Seeded Data**

```sql
-- Count menus (should be 28: 7 days × 4 meals)
SELECT COUNT(*) FROM mess_menus;

-- Count items (should be ~140: 28 menus × 5 items avg)
SELECT COUNT(*) FROM menu_items;

-- View sample menu
SELECT * FROM mess_menus WHERE day = 'Monday' AND meal_type = 'Breakfast';

-- View sample items
SELECT item_name, category, calories, is_veg 
FROM menu_items 
LIMIT 10;

-- View meal timings (should be 4)
SELECT * FROM meal_timings;

-- Exit SQLite
.exit
```

---

## ✅ Success Criteria

Your Smart Dining module is working if:

1. **Server starts** without errors
2. **All health checks** return success
3. **Today's menu API** returns 4 meals with items
4. **Weekly menu API** returns 28 menus
5. **Search API** filters correctly
6. **AI APIs** return recommendations and answers
7. **Manager dashboard** shows stats
8. **Admin dashboard** shows comprehensive analytics
9. **Frontend loads** without errors
10. **Theme toggle** works
11. **Search box** filters menu items
12. **Database has** 28 menus and ~140 items

---

## 🐛 Common Issues & Fixes

### **Issue: Port 5000 already in use**
```bash
# Kill existing process
lsof -ti:5000 | xargs kill -9

# Or use different port
export FLASK_PORT=5001
python backend/app.py
```

### **Issue: ModuleNotFoundError**
```bash
# Make sure you're in project root
pwd  # Should show: .../CampusPlus-AI

# Install dependencies
pip install -r requirements.txt
```

### **Issue: Database not seeded**
```bash
# Delete database and restart
rm backend/instance/campuspulse_dev.db
python backend/app.py
```

### **Issue: CORS errors in browser**
```bash
# Install flask-cors
pip install flask-cors

# Add to backend/app.py:
from flask_cors import CORS
CORS(app)
```

### **Issue: Frontend not loading**
```bash
# Make sure you're accessing correct URL
http://localhost:5000/pages/mess.html

# Not: file:///path/to/mess.html
```

---

## 📊 Expected Data

After seeding, you should have:

- **28 Menus** (7 days × 4 meals)
- **~140 Menu Items** (5 items per menu avg)
- **4 Meal Timings** (Breakfast, Lunch, Snacks, Dinner)
- **4 Test Users** (student, admin, maintenance, mess_manager)
- **0 Ratings** (initially - can be added via API)
- **0 Feedback** (initially - can be added via API)
- **0 Attendance** (initially - can be added via API)

---

## 🧪 Advanced Testing (Optional)

### **Create a Rating**
```bash
# First, you need to be authenticated
# This requires implementing login flow

# For now, you can directly insert into DB:
sqlite3 backend/instance/campuspulse_dev.db
INSERT INTO food_ratings (item_id, user_id, rating) VALUES (1, 1, 5);
.exit

# Then test get ratings API
curl http://localhost:5000/api/manager/ratings
```

### **Create Feedback**
```bash
# Directly insert into DB:
sqlite3 backend/instance/campuspulse_dev.db
INSERT INTO food_feedback (item_id, user_id, feedback_text, feedback_type) 
VALUES (1, 1, 'Excellent taste!', 'praise');
.exit

# Test get feedback API
curl http://localhost:5000/api/manager/feedback
```

### **Mark Attendance**
```bash
# Directly insert into DB:
sqlite3 backend/instance/campuspulse_dev.db
INSERT INTO meal_attendance (menu_id, user_id, attendance_date, is_attending) 
VALUES (1, 1, '2026-07-30', 1);
.exit

# Test admin dashboard (should show attendance)
curl http://localhost:5000/api/admin/dashboard
```

---

## 📝 Test Report Template

After testing, note your results:

```
Smart Dining Module Test Report
================================

Date: _____________
Tester: _____________

Backend APIs:
[ ] Health checks passed
[ ] Student APIs working
[ ] Manager APIs working
[ ] Admin APIs working
[ ] AI APIs working

Frontend:
[ ] Page loads correctly
[ ] Theme toggle works
[ ] Search works
[ ] View switcher works
[ ] Mobile responsive

Database:
[ ] All tables created
[ ] Data seeded correctly
[ ] Queries working

Issues Found:
1. _____________
2. _____________
3. _____________

Overall Status: ☐ Pass  ☐ Fail

Notes:
_____________________________________________
_____________________________________________
```

---

## 🎉 Next Steps After Testing

If all tests pass:

1. ✅ **Backend is production-ready**
2. ⏳ **Frontend needs API integration**
3. 🔄 **Start connecting UI to backend**
4. 🎨 **Add modals for rating/feedback**
5. 📊 **Integrate Chart.js for analytics**
6. 🧪 **Write automated tests**
7. 🚀 **Deploy to staging/production**

---

**Happy Testing! 🚀**

If you encounter any issues, check the main implementation document:  
`SMART_DINING_IMPLEMENTATION_COMPLETE.md`
