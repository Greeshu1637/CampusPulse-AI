# 🟢 SMART DINING MODULE - Sprint 1 Implementation Plan

## Current Status: Phase 1 Complete ✅

### ✅ Phase 1: Database Models (COMPLETE)
**Files Created/Modified:**
- `backend/models/mess.py` - Complete rewrite with 6 models
- `backend/models/__init__.py` - Updated imports
- `backend/services/smart_dining_service.py` - Started (StudentDiningService)

**Models Implemented:**
1. ✅ **MealTiming** - Meal schedule configuration
2. ✅ **MessMenu** - Daily meal menus with publishing control
3. ✅ **MenuItem** - Food items with nutrition, allergens, ratings
4. ✅ **FoodRating** - 1-5 star ratings (one per student per item)
5. ✅ **FoodFeedback** - Detailed text feedback with types
6. ✅ **MealAttendance** - Student attendance tracking

**Features:**
- Proper foreign keys and relationships
- Indexes for performance
- Unique constraints
- Check constraints (rating 1-5)
- Cascade deletes
- to_dict() methods for JSON serialization
- Business logic methods (get_average_rating, etc.)

---

## Remaining Implementation

### Phase 2: Service Layer (IN PROGRESS)
**Status**: StudentDiningService started, need to complete:

1. **StudentDiningService** (Partially Complete)
   - ✅ get_today_menu()
   - ✅ get_weekly_menu()
   - ✅ search_menu()
   - ✅ rate_food()
   - ✅ submit_feedback()
   - ✅ mark_attendance()
   - ✅ get_my_ratings()
   - ⏳ get_ai_recommendations() - TODO

2. **MessManagerService** (TODO)
   - create_menu()
   - update_menu()
   - delete_menu()
   - add_menu_items()
   - remove_menu_items()
   - publish_menu()
   - unpublish_menu()
   - add_special_meal()
   - add_festival_menu()
   - close_meal()
   - update_meal_timing()
   - get_ratings_report()
   - get_feedback_report()
   - get_attendance_report()
   - respond_to_feedback()

3. **AdminAnalyticsService** (TODO)
   - get_daily_attendance()
   - get_weekly_attendance()
   - get_attendance_trend()
   - get_popular_foods()
   - get_least_popular_foods()
   - get_average_ratings()
   - get_rating_trends()
   - estimate_food_waste()
   - get_meal_analytics()
   - export_report()

4. **AIRecommendationService** (TODO)
   - get_today_breakfast_answer()
   - filter_veg_items()
   - get_highest_rated_meal()
   - predict_rice_requirement()
   - suggest_menu_improvements()
   - generate_recommendations()

### Phase 3: Backend Routes (TODO)
**Files to Create:**
1. `backend/routes/student_dining.py` - Student API endpoints
2. `backend/routes/mess_manager.py` - Manager CRUD endpoints
3. `backend/routes/dining_analytics.py` - Admin analytics endpoints

**Endpoints Needed:**

**Student Routes** (`/api/dining/*`)
- GET `/api/dining/today` - Today's menu
- GET `/api/dining/week` - Weekly menu
- GET `/api/dining/search?q=...` - Search menu
- POST `/api/dining/rate` - Rate food
- POST `/api/dining/feedback` - Submit feedback
- POST `/api/dining/attendance` - Mark attendance
- GET `/api/dining/my-ratings` - Student's ratings
- GET `/api/dining/recommendations` - AI recommendations

**Mess Manager Routes** (`/api/mess-manager/*`)
- GET `/api/mess-manager/menus` - List all menus
- POST `/api/mess-manager/menu` - Create menu
- PUT `/api/mess-manager/menu/:id` - Update menu
- DELETE `/api/mess-manager/menu/:id` - Delete menu
- POST `/api/mess-manager/menu/:id/items` - Add items
- DELETE `/api/mess-manager/item/:id` - Remove item
- PATCH `/api/mess-manager/menu/:id/publish` - Publish/unpublish
- POST `/api/mess-manager/special-meal` - Add special meal
- PATCH `/api/mess-manager/close-meal/:id` - Close meal
- GET `/api/mess-manager/ratings` - Ratings report
- GET `/api/mess-manager/feedback` - Feedback report
- GET `/api/mess-manager/attendance` - Attendance report
- PATCH `/api/mess-manager/feedback/:id/respond` - Respond to feedback

**Admin Analytics Routes** (`/api/admin/dining-analytics/*`)
- GET `/api/admin/dining-analytics/daily-attendance` - Daily attendance
- GET `/api/admin/dining-analytics/weekly-attendance` - Weekly attendance
- GET `/api/admin/dining-analytics/popular-foods` - Most liked
- GET `/api/admin/dining-analytics/unpopular-foods` - Least liked
- GET `/api/admin/dining-analytics/ratings-trend` - Rating trends
- GET `/api/admin/dining-analytics/food-waste` - Waste estimation
- GET `/api/admin/dining-analytics/export` - Export report

### Phase 4: Frontend - Student Features (TODO)
**Files to Create/Modify:**

1. **Student Dashboard Integration**
   - Modify `frontend/pages/dashboard.html` - Enhanced Smart Dining section
   - Modify `frontend/js/dashboard.js` - Complete SmartDiningManager
   - Modify `frontend/css/style.css` - Additional styles

**Features to Add:**
- ✅ Today's menu (already implemented)
- ✅ Weekly menu (already implemented)
- ⏳ Veg/Non-veg badges
- ⏳ Special meal badges
- ⏳ Star rating component (interactive)
- ⏳ Feedback form modal
- ⏳ Search bar with filters
- ⏳ Attendance marking ("I'm eating")
- ⏳ AI recommendations card
- ⏳ Previous ratings view
- ⏳ Meal status indicator (live)
- ⏳ Nutritional information display

### Phase 5: Frontend - Mess Manager Dashboard (TODO)
**Files to Create:**

1. `frontend/pages/mess-manager.html` - Complete manager dashboard
2. `frontend/css/mess-manager.css` - Manager-specific styles
3. `frontend/js/mess-manager.js` - Manager functionality

**Sections:**
- Dashboard overview
- Weekly menu calendar view
- Create/Edit menu form
- Menu item management
- Ratings & feedback viewer
- Attendance reports
- Special meals management
- Meal timing configuration

### Phase 6: Frontend - Admin Analytics (TODO)
**Files to Create:**

1. `frontend/pages/dining-analytics.html` - Analytics dashboard
2. `frontend/css/dining-analytics.css` - Analytics styles
3. `frontend/js/dining-analytics.js` - Charts and reports

**Features:**
- Daily/weekly attendance charts
- Rating trends (line charts)
- Popular/unpopular foods (bar charts)
- Food waste estimation
- Export reports (PDF/CSV)
- Date range filters

### Phase 7: Database Seeding (TODO)
**File to Create:**
- `backend/services/seed_smart_dining.py` - Complete seeding script

**Data to Seed:**
- Meal timings (4 meals)
- Weekly menus (7 days × 4 meals = 28 menus)
- Menu items (150+ items with categories, nutrition)
- Sample ratings
- Sample feedback
- Sample attendance

### Phase 8: Integration & Testing (TODO)
- Register routes in `backend/app.py`
- Update navigation menus
- Role-based access control
- Error handling
- Loading states
- Empty states
- Success/error toasts
- Form validation
- API testing
- UI testing

---

## File Structure

```
backend/
├── models/
│   ├── mess.py ✅ (Complete - 6 models)
│   └── __init__.py ✅ (Updated)
├── services/
│   ├── smart_dining_service.py ⏳ (Started - StudentDiningService)
│   └── seed_smart_dining.py ❌ (TODO)
├── routes/
│   ├── student_dining.py ❌ (TODO)
│   ├── mess_manager.py ❌ (TODO)
│   └── dining_analytics.py ❌ (TODO)
└── app.py ⏳ (Need to register new routes)

frontend/
├── pages/
│   ├── dashboard.html ⏳ (Need enhancements)
│   ├── mess-manager.html ❌ (TODO)
│   └── dining-analytics.html ❌ (TODO)
├── css/
│   ├── style.css ⏳ (Need additions)
│   ├── mess-manager.css ❌ (TODO)
│   └── dining-analytics.css ❌ (TODO)
└── js/
    ├── dashboard.js ⏳ (Need enhancements)
    ├── mess-manager.js ❌ (TODO)
    └── dining-analytics.js ❌ (TODO)
```

---

## Next Steps (Priority Order)

1. ✅ **Database Models** - COMPLETE
2. **Complete Service Layer** (Current)
   - Finish AIRecommendationService
   - Implement MessManagerService
   - Implement AdminAnalyticsService
3. **Backend Routes**
   - Student dining routes
   - Mess manager routes
   - Admin analytics routes
4. **Database Seeding**
   - Create comprehensive seed script
   - Seed all tables with realistic data
5. **Frontend - Student Features**
   - Enhance Smart Dining section
   - Add rating/feedback modals
   - Implement search
   - Add attendance marking
6. **Frontend - Mess Manager**
   - Create complete manager dashboard
   - CRUD operations UI
   - Reports viewer
7. **Frontend - Admin Analytics**
   - Create analytics dashboard
   - Implement charts
   - Export functionality
8. **Integration & Testing**
   - Register all routes
   - Add role checks
   - Test complete flow
   - Fix bugs

---

## Estimated Progress

- **Database Models**: 100% ✅
- **Service Layer**: 20% ⏳
- **Backend Routes**: 0% ❌
- **Frontend Student**: 30% ⏳ (basic view exists)
- **Frontend Manager**: 0% ❌
- **Frontend Admin**: 0% ❌
- **Database Seeding**: 0% ❌
- **Integration**: 0% ❌

**Overall Progress**: ~15% Complete

---

## Time Estimate

- Service Layer completion: 2-3 hours
- Backend Routes: 2-3 hours
- Database Seeding: 1 hour
- Frontend Student: 3-4 hours
- Frontend Manager: 4-5 hours
- Frontend Admin: 3-4 hours
- Integration & Testing: 2-3 hours

**Total**: ~17-25 hours of development

---

## Quality Checklist

### Must Have Before "Done":
- [ ] All 6 database models working
- [ ] Database migrations successful
- [ ] All service methods implemented
- [ ] All API endpoints working
- [ ] Student features functional
- [ ] Manager CRUD working
- [ ] Admin analytics displaying
- [ ] Role-based permissions enforced
- [ ] Data validation working
- [ ] Error handling implemented
- [ ] No console errors
- [ ] No server errors
- [ ] All features tested
- [ ] Responsive on mobile
- [ ] Loading states present
- [ ] Empty states present
- [ ] Success/error messages
- [ ] Data persistence verified

---

## Current Session Recommendation

Given the scope of this feature sprint (25+ hours of work), I recommend we proceed in phases:

**Option A: Complete Feature-by-Feature**
1. Finish StudentDiningService today
2. Create student dining routes
3. Enhance student UI
4. Test student features end-to-end
5. Then move to Manager features
6. Then Admin features

**Option B: Complete Layer-by-Layer**
1. Finish all service classes
2. Create all routes
3. Seed database
4. Build all frontends
5. Integrate everything

**Recommendation**: **Option A** - Feature-by-feature allows testing and validation as we go.

---

Would you like me to:
1. Continue with completing the service layer?
2. Start building the backend routes?
3. Focus on enhancing the student UI first?
4. Create the database seeding script?

Let me know your preference!
