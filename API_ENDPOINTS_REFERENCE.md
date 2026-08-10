# Smart Dining API Endpoints - Quick Reference 📡

**Total Endpoints: 27**

---

## 🎨 Student APIs (10 Endpoints)

**Base URL:** `/api/dining/*`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/dining/today` | Get today's complete menu | None | ✅ |
| GET | `/api/dining/week` | Get 7-day weekly menu | None | ✅ |
| GET | `/api/dining/search` | Search menu items | None | ✅ |
| POST | `/api/dining/rate` | Rate a food item (1-5) | ✅ Required | ✅ |
| POST | `/api/dining/feedback` | Submit text feedback | ✅ Required | ✅ |
| POST | `/api/dining/attendance` | Mark meal attendance | ✅ Required | ✅ |
| GET | `/api/dining/my-ratings` | Get my rating history | ✅ Required | ✅ |
| GET | `/api/dining/recommendations` | Get AI recommendations | None | ✅ |
| POST | `/api/dining/ask` | Ask AI a question | None | ✅ |
| GET | `/api/dining/health` | Health check | None | ✅ |

---

## 👔 Manager APIs (11 Endpoints)

**Base URL:** `/api/manager/*`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/api/manager/menu` | Create new menu | Manager | ✅ |
| PUT | `/api/manager/menu/<id>` | Update menu | Manager | ✅ |
| DELETE | `/api/manager/menu/<id>` | Delete menu | Manager | ✅ |
| GET | `/api/manager/menus` | Get all menus | Manager | ✅ |
| GET | `/api/manager/menu/<id>` | Get menu by ID | Manager | ✅ |
| GET | `/api/manager/ratings` | Get all ratings | Manager | ✅ |
| GET | `/api/manager/feedback` | Get all feedback | Manager | ✅ |
| POST | `/api/manager/feedback/<id>/respond` | Respond to feedback | Manager | ✅ |
| GET | `/api/manager/dashboard` | Dashboard KPIs | Manager | ✅ |
| GET | `/api/manager/reports/attendance` | Attendance report | Manager | ✅ |
| GET | `/api/manager/health` | Health check | None | ✅ |

---

## 👑 Admin APIs (8 Endpoints)

**Base URL:** `/api/admin/*`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/admin/dashboard` | Complete admin dashboard | Admin | ✅ |
| GET | `/api/admin/attendance` | Detailed attendance report | Admin | ✅ |
| GET | `/api/admin/ratings` | Rating analytics | Admin | ✅ |
| GET | `/api/admin/popularity` | Food popularity report | Admin | ✅ |
| GET | `/api/admin/nutrition` | Nutritional analysis | Admin | ✅ |
| GET | `/api/admin/feedback` | Feedback analysis | Admin | ✅ |
| GET | `/api/admin/export` | Export comprehensive report | Admin | ✅ |
| GET | `/api/admin/health` | Health check | None | ✅ |

---

## 📖 Detailed API Documentation

### 1. GET `/api/dining/today`

**Description:** Get today's complete menu with all meals

**Query Params:** None

**Response:**
```json
{
  "success": true,
  "date": "2026-07-30",
  "day": "Thursday",
  "current_time": "14:30",
  "meals": [
    {
      "id": 123,
      "meal_type": "Breakfast",
      "time": "07:30 - 09:00",
      "time_start": "07:30",
      "time_end": "09:00",
      "status": "completed",
      "is_special": false,
      "is_festival": false,
      "attendance_count": 456,
      "average_rating": 4.2,
      "items": [
        {
          "id": 1,
          "item_name": "Idli",
          "category": "Main Course",
          "is_veg": true,
          "calories": 120,
          "protein_g": 4.0,
          "carbs_g": 25.0,
          "fat_g": 0.5,
          "average_rating": 4.5,
          "rating_count": 45
        }
      ]
    }
  ],
  "rating": 4.3,
  "total_ratings": 150,
  "total_items": 32
}
```

---

### 2. GET `/api/dining/week`

**Description:** Get complete weekly menu

**Query Params:** None

**Response:**
```json
{
  "success": true,
  "week": [
    {
      "day": "Monday",
      "date": null,
      "meals": [...],
      "total_items": 30
    }
  ]
}
```

---

### 3. GET `/api/dining/search`

**Description:** Search menu items

**Query Params:**
- `q` (string) - Search query
- `is_veg` (boolean) - Filter vegetarian
- `category` (string) - Filter by category
- `is_popular` (boolean) - Filter popular items

**Example:**
```
GET /api/dining/search?q=idli&is_veg=true
```

**Response:**
```json
{
  "success": true,
  "query": "idli",
  "filters": {"is_veg": true},
  "count": 3,
  "results": [...]
}
```

---

### 4. POST `/api/dining/rate`

**Description:** Submit or update food rating

**Auth:** ✅ Required (student)

**Body:**
```json
{
  "item_id": 123,
  "rating": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "rating": {
    "item_id": 123,
    "item_name": "Idli",
    "your_rating": 5,
    "average_rating": 4.5,
    "total_ratings": 46
  }
}
```

---

### 5. POST `/api/dining/feedback`

**Description:** Submit detailed feedback

**Auth:** ✅ Required (student)

**Body:**
```json
{
  "item_id": 123,
  "feedback_text": "Excellent taste!",
  "feedback_type": "praise",
  "is_anonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedback": {
    "id": 456,
    "item_id": 123,
    "feedback_text": "Excellent taste!",
    "feedback_type": "praise",
    "is_anonymous": false,
    "created_at": "2026-07-30T14:30:00"
  }
}
```

---

### 6. POST `/api/dining/attendance`

**Description:** Mark meal attendance

**Auth:** ✅ Required (student)

**Body:**
```json
{
  "menu_id": 123,
  "attendance_date": "2026-07-30",
  "is_attending": true,
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "attendance": {
    "menu_id": 123,
    "meal_type": "Lunch",
    "is_attending": true,
    "total_attending": 457
  }
}
```

---

### 7. GET `/api/dining/my-ratings`

**Description:** Get student's rating history

**Auth:** ✅ Required (student)

**Query Params:**
- `limit` (int) - Number of ratings (default: 10)

**Example:**
```
GET /api/dining/my-ratings?limit=20
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "ratings": [
    {
      "id": 1,
      "item_name": "Idli",
      "rating": 5,
      "created_at": "2026-07-30T08:00:00"
    }
  ]
}
```

---

### 8. GET `/api/dining/recommendations`

**Description:** Get AI-powered recommendations

**Query Params:** None

**Response:**
```json
{
  "success": true,
  "count": 5,
  "recommendations": [
    {
      "type": "highest_rated",
      "title": "🌟 Today's Top Rated: Lunch",
      "description": "Rated 4.8/5.0 by students",
      "meal_type": "Lunch",
      "time": "12:00 PM - 02:30 PM",
      "rating": 4.8
    },
    {
      "type": "popular_veg",
      "title": "🥗 Popular Veg Choice: Paneer Tikka",
      "description": "Available on Monday - Lunch",
      "item_name": "Paneer Tikka",
      "rating": 4.7
    }
  ]
}
```

---

### 9. POST `/api/dining/ask`

**Description:** Ask AI a natural language question

**Body:**
```json
{
  "question": "What's today's breakfast?"
}
```

**Response:**
```json
{
  "success": true,
  "question": "What's today's breakfast?",
  "answer": "Today's breakfast (07:30 - 09:00) includes: Idli, Sambar, Chutney",
  "data": {...}
}
```

**Supported Questions:**
- "What's today's breakfast?"
- "Show only veg food"
- "Which meal has the highest rating?"
- "Predict tomorrow's rice requirement"
- "Suggest menu improvements"

---

### 10. POST `/api/manager/menu`

**Description:** Create new menu with items

**Auth:** ✅ Manager required

**Body:**
```json
{
  "day": "Monday",
  "meal_type": "Breakfast",
  "menu_date": "2026-08-05",
  "time_start": "07:30",
  "time_end": "09:00",
  "is_special": false,
  "description": "Regular breakfast",
  "estimated_servings": 500,
  "items": [
    {
      "item_name": "Idli",
      "category": "Main Course",
      "is_veg": true,
      "calories": 120,
      "protein_g": 4.0,
      "carbs_g": 25.0,
      "fat_g": 0.5
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu created successfully",
  "menu": {...}
}
```

---

### 11. GET `/api/manager/dashboard`

**Description:** Get manager dashboard KPIs

**Auth:** ✅ Manager required

**Response:**
```json
{
  "success": true,
  "stats": {
    "today_attendance": 456,
    "average_rating": 4.3,
    "active_feedback": 12,
    "total_menus": 28,
    "food_waste_status": "Low",
    "weekly_attendance": [...],
    "popular_items": [...]
  }
}
```

---

### 12. GET `/api/admin/dashboard`

**Description:** Complete admin analytics dashboard

**Auth:** ✅ Admin required

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "key_metrics": {
      "total_students": 1200,
      "today_attendance": 456,
      "today_attendance_pct": 38.0,
      "weekly_avg_attendance": 420,
      "weekly_attendance_pct": 35.0,
      "total_ratings": 2456,
      "average_rating": 4.3,
      "waste_percentage": 8.5,
      "waste_status": "Low"
    },
    "attendance_trend": [...],
    "rating_trend": [...],
    "popular_foods": [...],
    "unpopular_foods": [...],
    "meal_distribution": [...]
  }
}
```

---

### 13. GET `/api/admin/attendance`

**Description:** Detailed attendance report

**Auth:** ✅ Admin required

**Query Params:**
- `start_date` (string) - YYYY-MM-DD (default: 7 days ago)
- `end_date` (string) - YYYY-MM-DD (default: today)
- `group_by` (string) - 'day', 'week', 'month' (default: 'day')

**Example:**
```
GET /api/admin/attendance?start_date=2026-07-01&end_date=2026-07-31
```

**Response:**
```json
{
  "success": true,
  "start_date": "2026-07-01",
  "end_date": "2026-07-31",
  "total_attendance": 12000,
  "daily_report": {
    "2026-07-01": {
      "Breakfast": 450,
      "Lunch": 480,
      "Snacks": 320,
      "Dinner": 460
    }
  }
}
```

---

### 14. GET `/api/admin/popularity`

**Description:** Food popularity analysis

**Auth:** ✅ Admin required

**Response:**
```json
{
  "success": true,
  "total_items": 140,
  "popular_items": [
    {
      "item_name": "Paneer Tikka",
      "category": "Main Course",
      "is_veg": true,
      "average_rating": 4.8,
      "rating_count": 120
    }
  ],
  "unpopular_items": [...],
  "all_items": [...]
}
```

---

## 🔐 Authentication

**Current Status:** Session-based (future: JWT)

**Headers:**
```
Content-Type: application/json
```

**Auth Cookie:** Set via login endpoint (existing auth system)

**Decorators:**
- `@require_auth` - Any authenticated user
- `@require_manager` - Mess manager role
- `@require_admin` - Admin role

---

## 📝 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🎯 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (create) |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Auth required |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Unexpected error |
| 501 | Not Implemented | Feature not yet implemented |

---

## 🧪 Testing Examples

### Using curl:

```bash
# Get today's menu
curl http://localhost:5000/api/dining/today

# Search veg food
curl "http://localhost:5000/api/dining/search?is_veg=true"

# Rate food (with auth)
curl -X POST http://localhost:5000/api/dining/rate \
  -H "Content-Type: application/json" \
  -d '{"item_id": 1, "rating": 5}'

# Create menu (manager)
curl -X POST http://localhost:5000/api/manager/menu \
  -H "Content-Type: application/json" \
  -d '{
    "day": "Monday",
    "meal_type": "Breakfast",
    "time_start": "07:30",
    "time_end": "09:00",
    "items": [{"item_name": "Idli", "is_veg": true}]
  }'

# Admin dashboard
curl http://localhost:5000/api/admin/dashboard
```

### Using Python:

```python
import requests

# Get today's menu
response = requests.get('http://localhost:5000/api/dining/today')
data = response.json()
print(data['meals'])

# Search menu
response = requests.get(
    'http://localhost:5000/api/dining/search',
    params={'q': 'idli', 'is_veg': True}
)
results = response.json()
print(results['count'])

# Rate food
response = requests.post(
    'http://localhost:5000/api/dining/rate',
    json={'item_id': 1, 'rating': 5}
)
print(response.json())
```

### Using JavaScript:

```javascript
// Get today's menu
fetch('http://localhost:5000/api/dining/today')
  .then(res => res.json())
  .then(data => console.log(data.meals));

// Search menu
fetch('http://localhost:5000/api/dining/search?q=idli&is_veg=true')
  .then(res => res.json())
  .then(data => console.log(data.results));

// Rate food
fetch('http://localhost:5000/api/dining/rate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({item_id: 1, rating: 5})
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📚 Related Documentation

- **Full Implementation:** `SMART_DINING_IMPLEMENTATION_COMPLETE.md`
- **Quick Test Guide:** `SMART_DINING_QUICK_TEST.md`
- **README:** `README_SMART_DINING.md`

---

**Last Updated:** July 30, 2026  
**API Version:** 1.0.0  
**Status:** Production Ready ✅
