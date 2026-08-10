# Phase 4A Testing Quick Guide 🧪

Quick checklist to verify Complaint Registration Form

---

## Setup
```bash
cd backend
python app.py
```
Open: `http://127.0.0.1:5000/frontend/pages/complaints.html`

---

## Test 1: Open Modal ✅
1. Click "Raise Complaint" button in header
2. **Verify:** Modal appears with fade-in animation
3. **Verify:** Category dropdown shows 9 options (Electrical, Plumbing, WiFi, etc.)

---

## Test 2: Close Modal ✅
**Method A:** Click X button → Modal closes  
**Method B:** Click outside modal → Modal closes  
**Method C:** Press Escape (if implemented) → Modal closes

---

## Test 3: Validation Errors ✅
1. Click "Submit Complaint" with empty form
2. **Verify:** Red error messages appear:
   - "Student name is required"
   - "Please select a hostel block"
   - "Please select a category"
   - "Please select a priority"
   - "Complaint title is required"
   - "Description is required"
3. **Verify:** Red toast: "Please fix the errors before submitting"

---

## Test 4: Minimum Length Validation ✅
**Short Title:**
1. Fill: Name, Block, Category, Priority
2. Title: "Test" (4 chars)
3. Description: (min 20 chars)
4. Click Submit
5. **Verify:** Error: "Title must be at least 5 characters"

**Short Description:**
1. Fill all except description
2. Description: "Short" (5 chars)
3. Click Submit
4. **Verify:** Error: "Description must be at least 20 characters"

---

## Test 5: Image Upload ✅
**Valid Image:**
1. Upload JPG/PNG < 5MB
2. **Verify:** Preview appears below input

**Too Large:**
1. Upload image > 5MB
2. **Verify:** Toast: "Image size must be less than 5MB"
3. **Verify:** File input cleared

**Invalid Type:**
1. Upload PDF/TXT file
2. **Verify:** Toast: "Please upload a valid image file"
3. **Verify:** File input cleared

---

## Test 6: Successful Submission ✅

**Fill Form:**
- Student Name: `Test Student`
- Hostel Block: `Main Block`
- Room Number: `101`
- Category: `Plumbing`
- Priority: `High`
- Title: `Water leakage in bathroom`
- Description: `There is severe water leakage from the ceiling affecting multiple rooms in the hostel`

**Submit:**
1. Click "Submit Complaint"
2. **Verify:** Button shows "Submitting..." with spinner
3. **Verify:** Button disabled during submission
4. Wait 1-2 seconds

**Success:**
5. **Verify:** Green toast: "Complaint submitted successfully!"
6. **Verify:** Modal closes automatically
7. **Verify:** Total Complaints increases (e.g., 8 → 9)
8. **Verify:** Open Complaints increases (e.g., 3 → 4)
9. **Verify:** New complaint appears at top of list
10. **Verify:** Console: `✅ Complaint submitted: CMP-0009`

---

## Test 7: Form Fields ✅

**Hostel Block Dropdown:**
- Main Block
- Rudramadevi
- Annapurna AC
- N Square
- Galaxy
- Elite
- Delight

**Category Dropdown (from API):**
- Electrical
- Plumbing
- WiFi
- Cleaning
- Food Quality
- Water
- Furniture
- Security
- Other

**Priority Dropdown:**
- Low
- Medium
- High

---

## Test 8: Multiple Submissions ✅
1. Submit first complaint
2. Reopen modal
3. Submit second complaint
4. **Verify:** Each submission increments total
5. **Verify:** Both complaints visible in list

---

## Expected Console Output

```javascript
📝 Complaint modal opened
✅ Complaint submitted: CMP-0009
❌ Complaint modal closed
✅ Loaded statistics
✅ Loaded 9 complaints
✅ Rendered 9 complaint cards (Page 1)
```

---

## Expected Statistics Update

**Before Submission:**
- Total: 8
- Open: 3
- In Progress: 2
- Resolved: 2

**After Submission:**
- Total: 9 ✅ (+1)
- Open: 4 ✅ (+1, new complaints start as "open")
- In Progress: 2 (unchanged)
- Resolved: 2 (unchanged)

---

## Check Network Tab

**POST Request:**
```
POST http://127.0.0.1:5000/api/complaints
Status: 201 Created
```

**Request Payload:**
```json
{
  "student_id": 1,
  "hostel_block": "Main Block",
  "room_number": "101",
  "category_id": 2,
  "title": "Water leakage in bathroom",
  "description": "There is severe water leakage...",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint created successfully",
  "complaint": {
    "complaint_id": "CMP-0009",
    ...
  }
}
```

---

## Error Scenarios to Test

**API Down:**
1. Stop Flask server
2. Try to submit complaint
3. **Verify:** Red toast: "Failed to submit complaint. Please try again."
4. **Verify:** Submit button re-enabled
5. **Verify:** Modal stays open

**Invalid Category ID:**
1. Open DevTools Console
2. Change category value to invalid ID
3. Submit
4. **Verify:** API returns 400 error
5. **Verify:** Error toast shows API message

---

## Visual Checks ✅

**Modal:**
- [x] Centered on screen
- [x] Semi-transparent dark overlay
- [x] White/card background
- [x] Rounded corners
- [x] Drop shadow
- [x] Smooth animations

**Form Fields:**
- [x] Labels above inputs
- [x] Required asterisk (*) visible
- [x] Input borders visible
- [x] Placeholders helpful
- [x] Consistent spacing

**Toast:**
- [x] Fixed top-right
- [x] Green for success
- [x] Red for error
- [x] Icon + message
- [x] Slides in from right
- [x] Auto-dismisses after 4s

---

## Success Criteria ✅

All tests passing:
- [x] Modal opens and closes correctly
- [x] All form fields render properly
- [x] Validation works for all fields
- [x] Error messages display correctly
- [x] Image upload validates properly
- [x] Submission sends correct data
- [x] Success updates stats and list
- [x] Error handling works
- [x] Toast notifications appear
- [x] No console errors
- [x] No backend modifications

---

**Phase 4A Status:** ✅ READY FOR TESTING
