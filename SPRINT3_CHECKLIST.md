# Sprint 3 - Smart Dining Implementation Checklist

## ✅ Pre-Deployment Checklist

### Database
- [ ] PostgreSQL is running
- [ ] Database `campuspulse_ai` exists
- [ ] `.env` file has correct DATABASE_URL
- [ ] Connection successful: `psql -U postgres -d campuspulse_ai`

### Virtual Environment
- [ ] Virtual environment exists: `.\venv\`
- [ ] Can activate: `.\venv\Scripts\activate`
- [ ] Flask is installed: `flask --version`
- [ ] All dependencies installed: `pip list`

### Files Created (Backend)
- [ ] `campuspulse/models.py` - Updated with User, MealMenu, MealFeedback, MealAttendance
- [ ] `campuspulse/services/__init__.py` - Created
- [ ] `campuspulse/services/dining_service.py` - Created (business logic)
- [ ] `campuspulse/blueprints/dining/__init__.py` - Created
- [ ] `campuspulse/blueprints/dining/routes.py` - Created (14 API endpoints)
- [ ] `campuspulse/__init__.py` - Updated (registered dining_bp)
- [ ] `campuspulse/routes.py` - Updated (added user_id to session)

### Files Created (Frontend Templates)
- [ ] `campuspulse/templates/dining/student.html` - Student view
- [ ] `campuspulse/templates/dining/manager.html` - Manager view
- [ ] `campuspulse/templates/dining/analytics.html` - Analytics view

### Files Created (CSS)
- [ ] `campuspulse/static/css/dining.css` - Smart Dining styles

### Files Created (JavaScript)
- [ ] `campuspulse/static/js/dining_student.js` - Student interactions
- [ ] `campuspulse/static/js/dining_manager.js` - Manager CRUD operations
- [ ] `campuspulse/static/js/dining_analytics.js` - Charts and analytics

### Files Updated
- [ ] `campuspulse/templates/dashboard.html` - Smart Dining link updated

### Migration
- [ ] `migrations/versions/48ad9672e689_add_smart_dining_models.py` - Created

### Documentation
- [ ] `SPRINT3_COMPLETE.md` - Full feature documentation
- [ ] `SPRINT3_SETUP.md` - Setup instructions
- [ ] `SPRINT3_SUMMARY.md` - Executive summary
- [ ] `SPRINT3_VISUAL_GUIDE.md` - UI/UX guide
- [ ] `SPRINT3_CHECKLIST.md` - This checklist

---

## 🚀 Deployment Steps

### Step 1: Activate Environment
```bash
cd C:\Users\Dell\OneDrive\Desktop\CampusPulse-AI-V2
.\venv\Scripts\activate
```
- [ ] Virtual environment activated (see `(venv)` in prompt)

### Step 2: Run Migration
```bash
flask db upgrade
```
- [ ] Migration runs without errors
- [ ] Output shows: "Running upgrade 92a16077d9e3 -> 48ad9672e689"
- [ ] No error messages

### Step 3: Verify Database
```bash
# Connect to PostgreSQL
psql -U postgres -d campuspulse_ai

# Check tables
\dt
```
- [ ] `meal_menus` table exists
- [ ] `meal_feedbacks` table exists
- [ ] `meal_attendances` table exists
- [ ] `users` table exists (from Sprint 1)

```sql
# Verify ENUM type
\dT+ meal_types
```
- [ ] `meal_types` ENUM exists with: breakfast, lunch, snacks, dinner

```sql
# Exit psql
\q
```

### Step 4: Start Application
```bash
python run.py
```
- [ ] Application starts without errors
- [ ] Output shows: "Running on http://127.0.0.1:5000"
- [ ] No import errors
- [ ] No blueprint registration errors

---

## 🧪 Testing Checklist

### Browser Access
- [ ] Open browser: `http://localhost:5000/`
- [ ] Login page loads correctly
- [ ] Theme toggle works (Light/Dark/System)
- [ ] Can select any role

### Test as Student

#### Access Smart Dining
- [ ] Login → Select "Student"
- [ ] Dashboard loads
- [ ] Sidebar shows "Smart Dining"
- [ ] Click "Smart Dining"
- [ ] URL changes to `/dining/student`
- [ ] Page loads without errors

#### Initial State (No Menus)
- [ ] See "No menu available" message
- [ ] Empty state icon displays
- [ ] Message is clear and helpful
- [ ] No JavaScript errors in console (F12)

### Test as Mess Manager

#### Access Management
- [ ] Login → Select "Mess Manager"
- [ ] Dashboard loads
- [ ] Sidebar shows "Smart Dining" and "Analytics"
- [ ] Click "Smart Dining"
- [ ] URL changes to `/dining/manager`
- [ ] Page loads without errors
- [ ] "Create Menu" button visible

#### Create First Menu (Breakfast)
- [ ] Click "Create Menu" button
- [ ] Modal opens
- [ ] Form fields visible:
  - [ ] Date picker (defaults to today)
  - [ ] Meal Type dropdown
  - [ ] Menu Items textarea
  - [ ] Description textarea
  - [ ] Calories input
- [ ] Select "breakfast"
- [ ] Enter menu items: "Idli, Sambar, Coconut Chutney, Coffee"
- [ ] Enter description: "South Indian breakfast special"
- [ ] Enter calories: 350
- [ ] Click "Save Menu"
- [ ] Modal closes
- [ ] Breakfast card appears on page
- [ ] Card shows:
  - [ ] "breakfast" badge (yellow/orange)
  - [ ] Menu items
  - [ ] Description
  - [ ] "350 cal"
  - [ ] "0 served" (initial)
  - [ ] "0 kg waste" (initial)
  - [ ] [Edit] button
  - [ ] [Waste] button
  - [ ] [Delete] button

#### Create More Menus
- [ ] Create Lunch menu
- [ ] Create Snacks menu
- [ ] Create Dinner menu
- [ ] All 4 cards display correctly
- [ ] Cards arranged in grid (2-4 columns based on screen width)

#### Edit Menu
- [ ] Click [Edit] on any card
- [ ] Modal opens with pre-filled data
- [ ] Change menu items
- [ ] Click "Save Menu"
- [ ] Card updates with new data

#### Record Food Waste
- [ ] Click [Waste] on any card
- [ ] Modal opens showing meal info
- [ ] Enter waste amount: 2.5
- [ ] Click "Update Waste"
- [ ] Card updates to show "2.5 kg waste"

#### Delete Menu
- [ ] Click [Delete] on any card
- [ ] Confirmation dialog appears
- [ ] Click "OK"
- [ ] Card disappears from page

### Test Student Features (After Menus Created)

#### View Menu
- [ ] Login → Select "Student"
- [ ] Go to Smart Dining
- [ ] See all meal cards
- [ ] Each card shows:
  - [ ] Meal type badge
  - [ ] Menu items
  - [ ] Description
  - [ ] Calories
  - [ ] Attendance count
  - [ ] [Mark Taken] button
  - [ ] [Rate Meal] button

#### Mark Attendance
- [ ] Click [Mark Taken] on breakfast card
- [ ] Success notification appears
- [ ] Page reloads (or updates)
- [ ] Attendance count increases by 1
- [ ] Button may be disabled or show "Already marked"

#### Submit Feedback
- [ ] Click [Rate Meal] on breakfast card
- [ ] Modal opens
- [ ] See meal info (type, items)
- [ ] Click stars to select rating (try 5 stars)
- [ ] Stars highlight when clicked
- [ ] Enter feedback text: "Delicious and fresh!"
- [ ] Click "Submit Feedback"
- [ ] Modal closes
- [ ] Success notification appears

#### View History
- [ ] Scroll to "My Meal History" section
- [ ] See attended meal in history
- [ ] History item shows:
  - [ ] Date ("Today")
  - [ ] Meal type badge
  - [ ] Menu items
  - [ ] Star rating (5 stars filled)
  - [ ] Feedback text

#### Update Feedback
- [ ] Click [Rate Meal] again on same meal
- [ ] Modal opens
- [ ] Change rating to 4 stars
- [ ] Change feedback text
- [ ] Click "Submit Feedback"
- [ ] History updates with new rating

### Test Analytics

#### Access Analytics
- [ ] Login → Select "Mess Manager"
- [ ] Click "Analytics" in sidebar
- [ ] URL changes to `/dining/analytics`
- [ ] Page loads without errors

#### View Statistics
- [ ] See 4 stat cards:
  - [ ] Average Rating (shows number out of 5.0)
  - [ ] Total Meals Served (shows count)
  - [ ] Food Waste (shows kg)
  - [ ] Student Satisfaction (shows percentage)
- [ ] Numbers make sense based on created data

#### View Charts
- [ ] See "Daily Attendance" bar chart
  - [ ] Chart renders without errors
  - [ ] Bars are visible
  - [ ] X-axis shows dates
  - [ ] Y-axis shows counts
  - [ ] Chart uses primary color
- [ ] See "Average Rating Trend" line chart
  - [ ] Chart renders without errors
  - [ ] Line is visible
  - [ ] Points are marked
  - [ ] Chart uses secondary color
- [ ] See "Food Waste Trend" line chart
  - [ ] Chart renders without errors
  - [ ] Line is visible
  - [ ] Points are marked
  - [ ] Chart uses red color

#### Change Period
- [ ] Select "Last 14 days" from dropdown
- [ ] Stats update
- [ ] Charts re-render with new data
- [ ] Select "Last 30 days"
- [ ] Stats update again

#### Export CSV
- [ ] Click "Export CSV" button
- [ ] CSV file downloads
- [ ] Open CSV file
- [ ] Verify contents:
  - [ ] Has summary section
  - [ ] Has daily attendance data
  - [ ] Has rating trend data
  - [ ] Has waste trend data
  - [ ] Data matches displayed stats

### Test Responsive Design

#### Desktop (>1024px)
- [ ] Sidebar visible (260px)
- [ ] Menu grid: 3-4 columns
- [ ] Stats grid: 4 columns
- [ ] Charts: full width
- [ ] All elements properly spaced

#### Tablet (768px-1024px)
- [ ] Resize browser to ~900px width
- [ ] Sidebar still visible
- [ ] Menu grid: 2 columns
- [ ] Stats grid: 2 columns
- [ ] Charts: full width
- [ ] Layout adjusts smoothly

#### Mobile (<768px)
- [ ] Resize browser to ~375px width
- [ ] Sidebar collapses (or becomes hamburger menu)
- [ ] Menu grid: 1 column
- [ ] Stats grid: 1 column
- [ ] Buttons stack vertically
- [ ] Modals fit screen
- [ ] Text remains readable
- [ ] Touch targets are large enough

### Test Theme Switching

#### On Login Page
- [ ] Default: Light theme
- [ ] Click "Dark" → Theme changes
- [ ] Click "Light" → Theme changes back
- [ ] Click "System" → Follows OS preference
- [ ] Theme persists on page reload

#### On Dining Pages
- [ ] Go to Smart Dining (any role)
- [ ] Switch to Dark theme
- [ ] Card backgrounds darken
- [ ] Text remains readable
- [ ] Badges adapt to theme
- [ ] Borders adapt to theme
- [ ] Charts adapt to theme

#### On Analytics Page
- [ ] Go to Analytics
- [ ] Switch between Light and Dark
- [ ] Charts update colors
- [ ] Chart text color changes
- [ ] Grid lines adapt
- [ ] All elements remain visible

### Test Error Handling

#### Invalid Menu Creation
- [ ] Try creating menu without meal type
  - [ ] Error message appears
- [ ] Try creating menu without menu items
  - [ ] Error message appears
- [ ] Try creating duplicate menu (same type, same date)
  - [ ] Error message: "Menu already exists"

#### Invalid Feedback
- [ ] Try submitting feedback without rating
  - [ ] Error message: "Please select a rating"

#### Invalid Waste
- [ ] Try entering negative waste
  - [ ] Error or validation prevents submission

### Test Navigation

#### From Dashboard
- [ ] Dashboard → Smart Dining → Works
- [ ] Dashboard → Analytics → Works
- [ ] Smart Dining → Dashboard → Works
- [ ] Analytics → Dashboard → Works
- [ ] Analytics → Smart Dining → Works

#### Sidebar Highlighting
- [ ] Active page highlighted in sidebar
- [ ] Correct icon and text color
- [ ] Smooth transitions

### Browser Compatibility
- [ ] Chrome/Edge (Chromium) - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work (if available)

### Performance
- [ ] Pages load in <2 seconds
- [ ] No console errors
- [ ] No console warnings (check F12)
- [ ] Smooth animations
- [ ] Charts render quickly
- [ ] Modal animations smooth

---

## 🐛 Known Issues / Notes

### Temporary User System
- Currently using `user_id = 1` from session
- No real authentication (as per Sprint 1 requirements)
- Multiple students will share same ID
- Ready for Google OAuth in future sprint

### Missing Features (By Design)
- No Google OAuth (Sprint 1 requirement: no auth yet)
- No email notifications
- No push notifications
- No meal preferences
- No dietary restrictions
- These are for future sprints

---

## 📊 Success Criteria

All these should be ✅:
- [ ] Migration completes successfully
- [ ] Application starts without errors
- [ ] All 3 views (student, manager, analytics) load
- [ ] Can create all 4 meal types
- [ ] Can edit menus
- [ ] Can delete menus
- [ ] Can record food waste
- [ ] Can mark attendance
- [ ] Can submit feedback
- [ ] Can view meal history
- [ ] Analytics page shows data
- [ ] Charts render correctly
- [ ] CSV export works
- [ ] Theme switching works
- [ ] Mobile responsive works
- [ ] No JavaScript errors
- [ ] No Python errors
- [ ] Design matches existing system

---

## 🎯 Final Verification

### Code Quality
- [ ] No syntax errors
- [ ] No import errors
- [ ] Type hints present where applicable
- [ ] Comments explain complex logic
- [ ] Functions have docstrings
- [ ] Variable names are descriptive

### Database
- [ ] All tables created
- [ ] All relationships working
- [ ] Constraints enforced
- [ ] Indexes created
- [ ] ENUM types created

### API
- [ ] All 14 endpoints respond
- [ ] Proper HTTP status codes
- [ ] JSON responses well-formed
- [ ] Error messages descriptive
- [ ] Validation working

### Frontend
- [ ] No broken images
- [ ] All icons visible (Lucide icons)
- [ ] Buttons clickable
- [ ] Forms submittable
- [ ] Modals open and close
- [ ] Loading states show
- [ ] Empty states show

### Design
- [ ] Matches existing design system
- [ ] Colors consistent
- [ ] Typography consistent
- [ ] Spacing consistent
- [ ] Border radius consistent
- [ ] Shadows consistent
- [ ] Transitions smooth

---

## 📝 If Something Fails

### Migration Fails
1. Check PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Try: `flask db downgrade` then `flask db upgrade`
4. Check migration file for syntax errors

### Application Won't Start
1. Check all imports
2. Check blueprint registration
3. Check for syntax errors
4. Try: `python -m flask run` instead

### Pages Don't Load
1. Check Flask routes
2. Check template paths
3. Check static file paths
4. Open browser console for errors

### Charts Don't Render
1. Check Chart.js CDN is loading
2. Check console for JavaScript errors
3. Check if API returns data
4. Try hard refresh (Ctrl+F5)

### Styles Look Wrong
1. Check CSS file is loading
2. Check theme.css is loaded first
3. Check components.css is loaded
4. Check dining.css is loaded
5. Clear browser cache

---

## ✅ Completion Status

**Sprint 3 Status**: Ready for Testing

Once all items in this checklist are verified:
- Mark Sprint 3 as ✅ COMPLETE
- Document any issues found
- Plan Sprint 4 features

---

**Next Steps**:
1. Run through this entire checklist
2. Mark each item as complete
3. Note any issues
4. Enjoy your Smart Dining module! 🍽️
