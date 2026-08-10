# Test Plan: Unified Dashboard with Smart Dining

## Prerequisites
- ✅ Server running at http://localhost:5000
- ✅ Database seeded with test user and mess data
- ✅ Modern browser (Chrome, Firefox, Edge)

---

## Test Credentials
```
Email: test@student.com
Password: Test@123
```

---

## Test Case 1: Login Flow
**Steps:**
1. Open http://localhost:5000/frontend/pages/login.html
2. Enter test credentials
3. Click "Sign In"

**Expected Result:**
- ✅ Redirects to `/frontend/pages/dashboard.html`
- ✅ NOT redirected to student-dashboard.html
- ✅ Shows unified dashboard with all sections

---

## Test Case 2: Smart Dining Section Visibility
**Steps:**
1. After login, scroll to "Smart Dining – Today's Menu" section
2. Verify section appears after AI Command Center

**Expected Result:**
- ✅ Section header shows "🍽️ Smart Dining – Today's Menu"
- ✅ Two tabs visible: "Today" (active) and "This Week"
- ✅ Menu date badge shows "Wednesday" (or current day)
- ✅ Rating shows stars with value (e.g., "⭐ 4.6/5.0")

---

## Test Case 3: Today's Menu Display
**Steps:**
1. Ensure "Today" tab is active (default)
2. Observe meal cards

**Expected Result:**
- ✅ 4 meal cards displayed: Breakfast, Lunch, Snacks, Dinner
- ✅ Each card shows:
  - Meal type with icon (e.g., "☕ Breakfast")
  - Time range (e.g., "07:30 - 09:30")
  - Status badge: Upcoming (blue) / Ongoing (green) / Completed (gray)
  - Food items as colorful tags
  - Special badge if meal is special (with ⭐ icon)

**Wednesday's Expected Meals:**
1. **Breakfast (07:30 - 09:30)**
   - Idli, Sambar, Coconut Chutney, Masala Tea, Banana

2. **Lunch (12:30 - 14:30)**
   - Chapati, Dal Tadka, Mix Veg Curry, Jeera Rice, Papad, Pickle

3. **Snacks (16:00 - 17:00)**
   - Bread Pakora, Green Chutney, Masala Tea

4. **Dinner (19:30 - 21:30)**
   - ⭐ Special: Paneer Butter Masala
   - Roti, Dal Makhani, Jeera Rice, Raita, Gulab Jamun

---

## Test Case 4: Status Badge Logic
**Steps:**
1. Note current system time
2. Check meal status badges

**Expected Logic:**
- If time < 07:30: All meals show "Upcoming"
- If 07:30-09:30: Breakfast "Ongoing", others "Upcoming" or "Completed"
- If time > 21:30: All meals show "Completed"

---

## Test Case 5: Weekly Menu View
**Steps:**
1. Click "This Week" tab
2. Wait for weekly menu to load

**Expected Result:**
- ✅ 7 day cards displayed (Monday - Sunday)
- ✅ Each day card shows:
  - Day name as header (e.g., "📅 Monday")
  - 4 meal sections (Breakfast, Lunch, Snacks, Dinner)
  - First 3 food items for each meal
  - "+X more" if more items exist
  - Time for each meal

---

## Test Case 6: Tab Switching
**Steps:**
1. Click "Today" tab
2. Click "This Week" tab
3. Click "Today" tab again

**Expected Result:**
- ✅ Views switch instantly without page reload
- ✅ Active tab has purple gradient background
- ✅ Inactive tab has default gray background
- ✅ Content updates correctly

---

## Test Case 7: Theme Toggle
**Steps:**
1. Note current theme (light/dark)
2. Click theme toggle button (sun/moon icon in topbar)
3. Observe Smart Dining section

**Expected Result:**
- ✅ Smart Dining section colors adapt to new theme
- ✅ Meal cards background changes
- ✅ Text colors adjust for readability
- ✅ Border colors update
- ✅ Badge colors remain vibrant in both themes

---

## Test Case 8: Responsive Design
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

**Expected Result:**

**Desktop:**
- ✅ 4-column meal grid (1 row)
- ✅ Week view: 3-4 day cards per row

**Tablet:**
- ✅ 2-column meal grid (2 rows)
- ✅ Week view: 2 day cards per row

**Mobile:**
- ✅ 1-column meal grid (4 rows)
- ✅ Week view: 1 day card per row
- ✅ Horizontal scroll if needed
- ✅ Touch-friendly card sizes

---

## Test Case 9: Loading States
**Steps:**
1. Open browser DevTools > Network tab
2. Throttle network to "Slow 3G"
3. Refresh page or switch tabs

**Expected Result:**
- ✅ Loading skeletons appear while fetching
- ✅ 4 skeleton cards in grid
- ✅ Animated shimmer effect
- ✅ Skeletons disappear when data loads

---

## Test Case 10: Error Handling
**Steps:**
1. Stop the backend server
2. Refresh the page
3. Try switching to "This Week" tab

**Expected Result:**
- ✅ Error message appears: "⚠️ Failed to load menu. Please try again."
- ✅ No JavaScript console errors that break the page
- ✅ Rest of dashboard remains functional

---

## Test Case 11: API Response Validation
**Steps:**
1. Open browser DevTools > Network tab
2. Filter by "XHR" or "Fetch"
3. Look for requests to `/api/mess/today` and `/api/mess/week`

**Expected Result:**
- ✅ `/api/mess/today` returns status 200
- ✅ Response contains:
  ```json
  {
    "success": true,
    "menu": {
      "date": "2026-07-29",
      "day": "Wednesday",
      "meals": [ /* 4 meals */ ],
      "rating": 4.6,
      "total_ratings": 142
    }
  }
  ```
- ✅ `/api/mess/week` returns 7 days with all meals

---

## Test Case 12: Console Verification
**Steps:**
1. Open browser DevTools > Console tab
2. Look for initialization messages

**Expected Messages:**
```javascript
✓ CampusPulse AI Dashboard — All modules initialized
SmartDiningManager initialized
```

**No Error Messages:**
- ❌ No 404 errors for API endpoints
- ❌ No JavaScript syntax errors
- ❌ No undefined variable errors
- ❌ No CORS errors

---

## Test Case 13: KPI Cards Integration
**Steps:**
1. Scroll to KPI Cards section at top of dashboard
2. Observe values

**Expected Result:**
- ✅ 8 KPI cards displayed
- ✅ Values show properly formatted numbers
- ✅ Sparkline charts render
- ✅ Change indicators show (▲ +3.2% or ▼ -5.6%)
- ✅ Cards fetch data from `/api/student/dashboard` if available

---

## Test Case 14: Navigation and Scrolling
**Steps:**
1. Test sidebar navigation
2. Click "Smart Dining" nav item (if present)
3. Try smooth scroll to Smart Dining section

**Expected Result:**
- ✅ Smooth scroll behavior
- ✅ Section comes into view
- ✅ No layout jumps or glitches

---

## Test Case 15: Browser Compatibility
**Test in Multiple Browsers:**
- Chrome/Edge (Chromium)
- Firefox
- Safari (if on Mac)

**Expected Result:**
- ✅ Works identically in all browsers
- ✅ CSS Grid renders correctly
- ✅ Fetch API works (or polyfilled)
- ✅ CSS variables supported

---

## Performance Checks

### Page Load Time
- ✅ Initial load < 2 seconds (on good connection)
- ✅ Today's menu renders in < 500ms after API response
- ✅ No layout shift after content loads

### Memory Usage
- ✅ No memory leaks on tab switching
- ✅ Old charts/data cleaned up properly

### Network Requests
- ✅ Only necessary API calls made
- ✅ No redundant requests
- ✅ Caching works (data not re-fetched unnecessarily)

---

## Accessibility Checks

### Keyboard Navigation
- ✅ Can tab through meal cards
- ✅ Can activate tab buttons with Enter/Space
- ✅ Focus indicators visible

### Screen Reader Support
- ✅ Meal types announced properly
- ✅ Status badges have meaningful labels
- ✅ Section headers clear

### Color Contrast
- ✅ Text readable in light mode
- ✅ Text readable in dark mode
- ✅ Badges have sufficient contrast

---

## Regression Tests

### Verify Existing Features Still Work
- ✅ Analytics charts render
- ✅ KPI cards display
- ✅ AI Command Center shows recommendations
- ✅ Digital Twin grid renders
- ✅ Recent Activities timeline works
- ✅ AI Copilot chat functions
- ✅ Theme toggle persists
- ✅ Sidebar collapse/expand works

---

## Edge Cases

### 1. No Menu Data
**Scenario**: Database has no menu for today
**Expected**: Shows message "No menu available for today"

### 2. Single Meal
**Scenario**: Only breakfast exists
**Expected**: Shows 1 meal card, no errors

### 3. Very Long Item Names
**Scenario**: Food item name > 50 characters
**Expected**: Item tag wraps or truncates properly

### 4. Special Characters in Food Names
**Scenario**: Food name contains &, <, >, ', "
**Expected**: Characters escaped properly, no XSS

### 5. Ratings Edge Cases
**Scenario**: 0 ratings or 5000+ ratings
**Expected**: Shows "0 ratings" or "5000 ratings" correctly

---

## Final Checklist

Before marking TASK 6 complete, verify:

- [ ] ✅ Login redirects to unified dashboard (not student-dashboard)
- [ ] ✅ Smart Dining section visible and styled correctly
- [ ] ✅ Today's menu fetches from `/api/mess/today`
- [ ] ✅ Week menu fetches from `/api/mess/week`
- [ ] ✅ 4 meal cards render for today
- [ ] ✅ 7 day cards render for week view
- [ ] ✅ Status badges show correct colors
- [ ] ✅ Special meals show star badge
- [ ] ✅ Theme toggle works (light/dark)
- [ ] ✅ Responsive on mobile/tablet/desktop
- [ ] ✅ Tab switching works smoothly
- [ ] ✅ Loading skeletons appear while fetching
- [ ] ✅ Error handling works when API fails
- [ ] ✅ No console errors
- [ ] ✅ No layout shifts
- [ ] ✅ All existing dashboard features still work

---

## Bug Report Template

If any test fails, report using this format:

```
Test Case: [Test Case Number and Name]
Browser: [Chrome 120 / Firefox 121 / Safari 17]
Device: [Desktop / Mobile]
Theme: [Light / Dark]

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
...

Actual Result:
...

Screenshots:
[Attach if applicable]

Console Errors:
[Copy from DevTools Console]
```

---

## Success Criteria

✅ **TASK 6 IS COMPLETE** when:
1. All 15 test cases pass
2. No critical bugs found
3. Performance is acceptable
4. No regression in existing features
5. Code is clean and documented
6. Implementation matches requirements

---

## Conclusion

Run through all test cases systematically. Document any issues found. Once all tests pass, TASK 6 can be marked as ✅ **COMPLETED**.
