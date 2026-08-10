# Smart Dining Frontend Integration - Testing Guide
## Quick Verification Steps

**Status**: Ready for Testing  
**Date**: July 30, 2026

---

## 🚀 QUICK START

### Step 1: Start Backend
```bash
cd backend
python app.py
```

**Expected Output**:
```
* Running on http://127.0.0.1:5000
* Smart Dining APIs loaded
* Database initialized
```

### Step 2: Open Frontend
Navigate to: `http://127.0.0.1:5000/pages/dashboard.html`

Or open the HTML file directly in browser if using file:// protocol.

---

## ✅ MANUAL TESTING CHECKLIST

### Test 1: Page Load
- [ ] Dashboard loads without errors
- [ ] No console errors
- [ ] Smart Dining section visible
- [ ] "Today" tab is active by default
- [ ] Loading skeleton appears briefly

**Expected**: Skeleton cards → Real menu data

### Test 2: Today's Menu
- [ ] Meals display (Breakfast, Lunch, Snacks, Dinner)
- [ ] Each meal shows items
- [ ] Meal status badges show correctly (Available/Upcoming/Ended)
- [ ] Time ranges display
- [ ] Menu date shows at top
- [ ] Rating shows (e.g., "4.5/5.0 (42 ratings)")

**Expected**: 4 meal cards with real data from API

### Test 3: Weekly Menu Tab
- [ ] Click "This Week" tab
- [ ] Weekly view appears
- [ ] 7 day cards display
- [ ] Today is highlighted
- [ ] Each day shows meals summary

**Expected**: Grid of 7 days, current day highlighted

### Test 4: Rating Modal
- [ ] Click any "Rate" button on a meal item
- [ ] Rating modal appears
- [ ] 5 stars display
- [ ] Click a star → it highlights (yellow)
- [ ] Rating text shows ("Poor", "Good", "Excellent", etc.)
- [ ] Click "Submit Rating"
- [ ] Loading spinner appears on button
- [ ] Success toast appears bottom-right
- [ ] Modal closes
- [ ] Menu refreshes with updated rating

**Expected**: Complete rating flow, no errors

### Test 5: Feedback Modal
- [ ] Click "Feedback" button
- [ ] Feedback modal appears
- [ ] Feedback type dropdown works (General, Praise, Complaint, Suggestion)
- [ ] Text area accepts input
- [ ] Anonymous checkbox toggles
- [ ] Submit with empty text → shows error
- [ ] Submit with text → success toast
- [ ] Modal closes

**Expected**: Complete feedback flow, validation works

### Test 6: Attendance
- [ ] Click "Mark Attendance" button
- [ ] Browser confirm dialog appears
- [ ] Click "OK"
- [ ] Success toast appears
- [ ] No errors in console

**Expected**: Attendance recorded via API

### Test 7: Loading States
**Test with backend OFF**:
- [ ] Stop Flask server
- [ ] Refresh dashboard
- [ ] Error message appears
- [ ] "Retry" button shows
- [ ] Click "Retry" → attempts to reload

**Expected**: Graceful error handling, retry works

### Test 8: Empty States
**Test with empty database**:
- [ ] Clear all menus from database
- [ ] Refresh page
- [ ] "No menu available for today" message shows

**Expected**: Empty state message, no crashes

---

## 🔍 BROWSER CONSOLE TESTS

Open Developer Tools (F12) → Console tab

### Test API Calls

```javascript
// Manually test SmartDiningManager
SmartDiningManager.loadTodayMenu();
// → Should show Promise, then menu renders

SmartDiningManager.loadWeeklyMenu();
// → Should show Promise, then weekly view renders

// Test rating modal (item ID 1, item name "Test")
SmartDiningManager.showRatingModal(1, 'Test Item');
// → Modal should appear

// Check if manager is initialized
console.log(SmartDiningManager);
// → Should show object with methods
```

### Check Network Tab
1. Open Network tab (F12 → Network)
2. Refresh dashboard
3. Look for:
   - `GET /api/dining/today` → Status 200
   - `GET /api/dining/week` → Status 200 (if weekly tab clicked)
4. Click "Rate" → Look for:
   - `POST /api/dining/rate` → Status 200
5. Click "Feedback" → Look for:
   - `POST /api/dining/feedback` → Status 200

**Expected**: All API calls return 200 OK with JSON data

---

## 🐛 TROUBLESHOOTING

### Problem: "Failed to load menu"

**Causes**:
1. Backend not running
2. Wrong API endpoint
3. Authentication required but user not logged in

**Solutions**:
```bash
# Check backend is running
curl http://127.0.0.1:5000/api/dining/today

# Check response
# Should return JSON with menu data
```

### Problem: Modal doesn't appear

**Causes**:
1. CSS not loaded
2. JavaScript error
3. Button click not bound

**Solutions**:
- Check browser console for errors
- Verify style.css is loaded
- Check if `SmartDiningManager` exists in console

### Problem: Toast notifications don't show

**Causes**:
1. CSS animations disabled
2. Z-index conflict
3. Element creation failed

**Solutions**:
- Check if toast element is created in DOM
- Verify CSS animations work
- Check z-index is 10000

### Problem: "Authentication required" (401 error)

**Causes**:
1. User not logged in
2. Session expired
3. CORS issues

**Solutions**:
- Log in through `/pages/login.html` first
- Check session cookies exist
- Verify `credentials: 'include'` in fetch calls

---

## 📊 EXPECTED API RESPONSES

### GET /api/dining/today
```json
{
  "success": true,
  "menu": {
    "id": 1,
    "date": "2026-07-30",
    "day": "Thursday",
    "avg_rating": 4.5,
    "rating_count": 42,
    "items": [
      {
        "id": 1,
        "name": "Idli Sambar",
        "meal_type": "Breakfast",
        "is_veg": true,
        "calories": 220,
        "protein": 8,
        "category": "Main Course"
      }
    ]
  }
}
```

### POST /api/dining/rate
**Request**:
```json
{
  "item_id": 1,
  "rating": 5
}
```

**Response**:
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "rating": {
    "item_id": 1,
    "rating": 5,
    "user_id": 123
  }
}
```

### POST /api/dining/feedback
**Request**:
```json
{
  "item_id": 1,
  "feedback_text": "Great taste!",
  "feedback_type": "praise",
  "is_anonymous": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback_id": 456
}
```

---

## ✨ SUCCESS CRITERIA

The integration is successful if:

1. ✅ Dashboard loads without errors
2. ✅ Today's menu displays from API
3. ✅ Weekly menu displays from API
4. ✅ Rating modal works end-to-end
5. ✅ Feedback modal works end-to-end
6. ✅ Attendance marking works
7. ✅ Loading states appear correctly
8. ✅ Error states show retry option
9. ✅ Empty states show helpful message
10. ✅ Toast notifications appear and dismiss
11. ✅ No console errors
12. ✅ All Network requests return 200 OK
13. ✅ UI matches existing design
14. ✅ Mobile responsive (test on narrow screen)
15. ✅ Theme toggle works (light/dark mode)

---

## 📸 VISUAL TESTING

### Desktop View
- [ ] Menu cards display in grid (2x2)
- [ ] Cards have proper spacing
- [ ] Text is readable
- [ ] Icons display correctly
- [ ] Modals are centered
- [ ] Toasts appear bottom-right

### Mobile View (< 768px)
- [ ] Menu cards stack vertically
- [ ] Modal takes full width
- [ ] Text remains readable
- [ ] Buttons are tap-friendly
- [ ] No horizontal scroll

### Dark Mode
- [ ] Toggle theme switch
- [ ] Colors invert properly
- [ ] Text remains readable
- [ ] Modal background darkens
- [ ] No white flashes

---

## 🔄 REGRESSION TESTING

**Ensure existing features still work**:
- [ ] Sidebar navigation
- [ ] Theme toggle
- [ ] Other dashboard sections (KPIs, Charts, etc.)
- [ ] AI Copilot
- [ ] Notifications
- [ ] Profile dropdown

**Expected**: No regressions, all existing features intact

---

## 📝 BUG REPORT TEMPLATE

If you find an issue:

```markdown
**Bug**: [Short description]

**Steps to Reproduce**:
1. Go to dashboard.html
2. Click "Today" tab
3. Click "Rate" button
4. ...

**Expected**: Modal should appear with 5 stars

**Actual**: [What happened instead]

**Screenshots**: [If applicable]

**Console Errors**: [Copy from browser console]

**Browser**: Chrome 126 / Firefox 128 / etc.

**Backend Status**: Running / Not Running

**User Logged In**: Yes / No
```

---

## ✅ FINAL CHECKLIST

Before marking as complete:

- [ ] All 8 manual tests pass
- [ ] Browser console tests pass
- [ ] Network tab shows 200 OK responses
- [ ] No JavaScript errors
- [ ] No CSS rendering issues
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Toast notifications work
- [ ] Modals open and close properly
- [ ] Loading states appear
- [ ] Error states show retry
- [ ] Empty states show message
- [ ] Existing dashboard features unaffected
- [ ] Code is clean and commented
- [ ] Integration document created

---

## 🎉 COMPLETION

Once all tests pass:

1. ✅ Mark integration as COMPLETE
2. ✅ Update project documentation
3. ✅ Deploy to staging environment
4. ✅ Request QA team review
5. ✅ Prepare for production deployment

---

**Testing Status**: ⏳ Pending  
**Last Updated**: July 30, 2026  
**Tested By**: [Your Name]  
**Sign-off**: [Pending]

---

## 📞 SUPPORT CONTACTS

- **Backend Issues**: Check `backend/` folder READMEs
- **Frontend Issues**: Check `frontend/` folder structure
- **API Documentation**: `API_ENDPOINTS_REFERENCE.md`
- **Integration Guide**: `FRONTEND_INTEGRATION_COMPLETE.md`

---

**Happy Testing!** 🚀
