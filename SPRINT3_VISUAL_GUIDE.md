# Sprint 3 - Smart Dining Visual Guide

## 🎨 User Interface Preview

### Student View (`/dining/student`)

```
┌─────────────────────────────────────────────────────────────┐
│  CampusPulse AI                    🌓 Light Dark System     │
├─────────────────────────────────────────────────────────────┤
│  ☰ Dashboard                                         [User] │
│  ► Smart Dining     ┌──────────────────────────────────┐   │
│    Hostel           │  Smart Dining                    │   │
│    Classroom        │  View today's menu and provide   │   │
│    Analytics        │  feedback                        │   │
│    Settings         └──────────────────────────────────┘   │
│                                                             │
│  Today's Menu                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ breakfast    │ │   lunch      │ │   snacks     │      │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤      │
│  │ Idli, Sambar │ │ Rice, Dal,   │ │ Tea, Samosa  │      │
│  │ Chutney      │ │ Curry        │ │ Biscuits     │      │
│  │              │ │              │ │              │      │
│  │ 350 cal      │ │ 550 cal      │ │ 250 cal      │      │
│  │ 👥 45 served │ │ 👥 120 served│ │ 👥 30 served │      │
│  │              │ │              │ │              │      │
│  │ [Mark Taken] │ │ [Mark Taken] │ │ [Mark Taken] │      │
│  │ [Rate Meal]  │ │ [Rate Meal]  │ │ [Rate Meal]  │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
│                                                             │
│  My Meal History                                            │
│  ┌─────────────────────────────────────────────────┐      │
│  │ Today         breakfast                         │      │
│  │ Idli, Sambar, Chutney                          │      │
│  │ ★★★★★ "Delicious!"                            │      │
│  ├─────────────────────────────────────────────────┤      │
│  │ Yesterday     lunch                            │      │
│  │ Rice, Dal, Curry                               │      │
│  │ ★★★★☆ "Good taste"                            │      │
│  └─────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

### Manager View (`/dining/manager`)

```
┌─────────────────────────────────────────────────────────────┐
│  CampusPulse AI                    🌓 Light Dark System     │
├─────────────────────────────────────────────────────────────┤
│  ☰ Dashboard                                         [User] │
│  ► Smart Dining     ┌──────────────────────────────────┐   │
│  ► Analytics        │  Mess Management                 │   │
│    Hostel           │  Create and manage daily menus   │   │
│    Settings         └──────────────────────────────────┘   │
│                                          [+ Create Menu]    │
│                                                             │
│  Today's Menu                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ breakfast    │ │   lunch      │ │  dinner      │      │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤      │
│  │ Idli, Sambar │ │ Rice, Dal,   │ │ Chapati,     │      │
│  │ Chutney      │ │ Curry        │ │ Paneer, Dal  │      │
│  │              │ │              │ │              │      │
│  │ 350 cal      │ │ 550 cal      │ │ 450 cal      │      │
│  │ 👥 45 served │ │ 👥 120 served│ │ 👥 85 served │      │
│  │ 🗑️ 2.3 kg    │ │ 🗑️ 3.5 kg   │ │ 🗑️ 1.8 kg   │      │
│  │              │ │              │ │              │      │
│  │ [Edit]       │ │ [Edit]       │ │ [Edit]       │      │
│  │ [Waste]      │ │ [Waste]      │ │ [Waste]      │      │
│  │ [Delete]     │ │ [Delete]     │ │ [Delete]     │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

### Analytics View (`/dining/analytics`)

```
┌─────────────────────────────────────────────────────────────┐
│  CampusPulse AI                    🌓 Light Dark System     │
├─────────────────────────────────────────────────────────────┤
│  ☰ Dashboard                                         [User] │
│    Smart Dining     ┌──────────────────────────────────┐   │
│  ► Analytics        │  Dining Analytics                │   │
│    Hostel           │  Track meal performance          │   │
│    Settings         └──────────────────────────────────┘   │
│                        [Last 7 days ▼]  [Export CSV]       │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────┐  │
│  │ ★ 4.3       │ │ 🍽️ 450      │ │ 🗑️ 12.5 kg  │ │😊85%│  │
│  │ Avg Rating  │ │ Total Meals │ │ Food Waste  │ │Satis│  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────┘  │
│                                                             │
│  Daily Attendance                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     │                                                │   │
│  │ 150 │     ███                                        │   │
│  │ 120 │   ████████                                     │   │
│  │  90 │ ████████████                                   │   │
│  │  60 │████████████████                                │   │
│  │  30 │████████████████████                            │   │
│  │   0 └───────────────────────────────────────────    │   │
│  │      7/25  7/26  7/27  7/28  7/29  7/30  7/31      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Average Rating Trend        Food Waste Trend              │
│  ┌─────────────────────┐   ┌─────────────────────┐       │
│  │  5 ╱────╲           │   │  4 ╱╲               │       │
│  │  4─╱      ╲─╱       │   │  3─  ╲    ╱╲        │       │
│  │  3           ╲      │   │  2    ╲__╱  ╲       │       │
│  │  2             ╲    │   │  1            ╲──    │       │
│  │  1               ╲  │   │  0                ╲  │       │
│  │  0────────────────  │   │  0────────────────  │       │
│  └─────────────────────┘   └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Modal Dialogs

### Rate Meal Modal

```
┌─────────────────────────────────────┐
│  Rate Your Meal             [×]     │
├─────────────────────────────────────┤
│                                     │
│  breakfast                          │
│  Idli, Sambar, Chutney             │
│                                     │
│  Rating                             │
│  ★ ★ ★ ★ ★                          │
│                                     │
│  Feedback (Optional)                │
│  ┌─────────────────────────────┐   │
│  │ Share your thoughts...      │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│         [Cancel] [Submit Feedback]  │
└─────────────────────────────────────┘
```

### Create Menu Modal

```
┌─────────────────────────────────────┐
│  Create Menu                [×]     │
├─────────────────────────────────────┤
│                                     │
│  Date                               │
│  [2026-07-31      ]                 │
│                                     │
│  Meal Type                          │
│  [breakfast       ▼]                │
│                                     │
│  Menu Items                         │
│  ┌─────────────────────────────┐   │
│  │ e.g., Idli, Sambar, Chutney │   │
│  └─────────────────────────────┘   │
│                                     │
│  Description (Optional)             │
│  ┌─────────────────────────────┐   │
│  │ Additional details...       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Calories (Optional)                │
│  [350              ]                │
│                                     │
│         [Cancel] [Save Menu]        │
└─────────────────────────────────────┘
```

### Update Waste Modal

```
┌─────────────────────────────────────┐
│  Update Food Waste          [×]     │
├─────────────────────────────────────┤
│                                     │
│  lunch                              │
│  Rice, Dal, Vegetable Curry        │
│                                     │
│  Food Waste (kg)                    │
│  [2.5              ]                │
│                                     │
│         [Cancel] [Update Waste]     │
└─────────────────────────────────────┘
```

---

## 🎨 Component Styles

### Meal Type Badges

```
┌──────────────────────────────────────┐
│ breakfast  │ Warm yellow/orange     │
│ lunch      │ Purple (primary)       │
│ snacks     │ Teal (secondary)       │
│ dinner     │ Light purple           │
└──────────────────────────────────────┘
```

### Star Rating (Interactive)

```
Unselected: ☆ ☆ ☆ ☆ ☆
Selected:   ★ ★ ★ ★ ★
Hover:      ★ ★ ★ ☆ ☆  (highlights on hover)
```

### Empty States

```
┌─────────────────────────────────────┐
│           ___                       │
│          /   \                      │
│         │ 🍽️ │                      │
│          \___/                      │
│                                     │
│  No menu available                  │
│  Today's menu has not been created  │
│  yet. Check back later.             │
└─────────────────────────────────────┘
```

---

## 📊 Chart Types

### Bar Chart (Daily Attendance)
- X-axis: Dates (7/25, 7/26, etc.)
- Y-axis: Meal count (0-150)
- Bars: Primary color (#7C5CFF)
- Background: Transparent with border

### Line Chart (Rating Trend)
- X-axis: Dates
- Y-axis: Rating (0-5)
- Line: Secondary color (#1BCFB4)
- Fill: Light gradient
- Points: Visible with white border

### Line Chart (Waste Trend)
- X-axis: Dates
- Y-axis: Waste in kg
- Line: Red (#EF4444)
- Fill: Light red gradient
- Points: Visible with white border

---

## 🔄 User Flows

### Student: Rate a Meal

```
1. Visit Smart Dining page
   ↓
2. View today's menu cards
   ↓
3. Click "Rate Meal" button
   ↓
4. Modal opens with meal info
   ↓
5. Click stars to select rating
   ↓
6. (Optional) Type feedback text
   ↓
7. Click "Submit Feedback"
   ↓
8. Modal closes, success message
   ↓
9. History updates with new rating
```

### Manager: Create Menu

```
1. Visit Mess Management page
   ↓
2. Click "Create Menu" button
   ↓
3. Modal opens with empty form
   ↓
4. Select date (defaults to today)
   ↓
5. Select meal type (breakfast/lunch/snacks/dinner)
   ↓
6. Enter menu items (required)
   ↓
7. Enter description (optional)
   ↓
8. Enter calories (optional)
   ↓
9. Click "Save Menu"
   ↓
10. Modal closes, menu card appears
```

### Manager: View Analytics

```
1. Visit Analytics page
   ↓
2. View 4 stat cards (auto-loaded)
   ↓
3. View 3 charts (auto-rendered)
   ↓
4. (Optional) Change period (7/14/30 days)
   ↓
5. Stats and charts update
   ↓
6. (Optional) Click "Export CSV"
   ↓
7. CSV file downloads
```

---

## 🎯 Interaction States

### Button States
```
Normal:   [Button Text]     │ Default appearance
Hover:    [Button Text]     │ Slight lift + shadow
Active:   [Button Text]     │ Pressed down
Disabled: [Button Text]     │ Grayed out
```

### Input States
```
Normal:   [          ]     │ Default border
Focus:    [          ]     │ Primary border + glow
Error:    [          ]     │ Red border
Success:  [          ]     │ Green border
```

### Card States
```
Normal:   ┌──────┐         │ Subtle shadow
Hover:    ┌──────┐         │ Elevated shadow + slight lift
Selected: ┌──────┐         │ Primary border
```

---

## 📐 Layout Breakpoints

### Desktop (>1024px)
```
├─────────┬──────────────────────────┐
│ Sidebar │   Main Content (wide)    │
│ 260px   │   3-4 column grids       │
│         │   Full-width charts      │
└─────────┴──────────────────────────┘
```

### Tablet (768px-1024px)
```
├─────────┬─────────────────┐
│ Sidebar │   Main Content  │
│ 260px   │   2 column grids│
│         │   Responsive    │
└─────────┴─────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────┐
│   Top Bar (≡ Menu)      │
├─────────────────────────┤
│                         │
│   Main Content          │
│   (1 column, stacked)   │
│                         │
│   Full-width elements   │
│                         │
└─────────────────────────┘
```

---

## 🌈 Color Usage

### Light Theme
```
Background: #F5F7FB │ ░░░░░░░░░
Cards:      #FFFFFF │ ████████
Primary:    #7C5CFF │ ■■■■■■■■ (purple)
Secondary:  #1BCFB4 │ ▓▓▓▓▓▓▓▓ (teal)
Text:       #1F2937 │ ████████ (dark gray)
Border:     #E5E7EB │ ────────
```

### Dark Theme
```
Background: #111827 │ ████████
Cards:      #1F2937 │ ▓▓▓▓▓▓▓▓
Primary:    #8B5CF6 │ ■■■■■■■■ (light purple)
Secondary:  #06B6D4 │ ░░░░░░░░ (cyan)
Text:       #F9FAFB │ ░░░░░░░░ (light gray)
Border:     #374151 │ ────────
```

---

## 📦 Data Flow

```
┌─────────┐      ┌─────────┐      ┌──────────┐
│ Browser │ HTTP │  Flask  │ SQL  │PostgreSQL│
│         │─────>│ Routes  │─────>│ Database │
│         │<─────│         │<─────│          │
│         │ JSON │         │ Data │          │
└─────────┘      └─────────┘      └──────────┘
     │                │                 │
     │                ├─ DiningService  │
     │                │  (Business Logic)
     │                │                 │
     │                ├─ Models        │
     │                │  (SQLAlchemy)  │
     │                │                 │
     └─ JavaScript ───┘                 │
        (UI Logic)                      │
```

---

## ✅ Visual Quality Checklist

- [x] Consistent border radius (14px/12px/8px)
- [x] Consistent spacing (8px grid)
- [x] Consistent colors (theme variables)
- [x] Consistent typography (Inter font)
- [x] Smooth transitions (200ms)
- [x] Professional shadows (soft only)
- [x] Accessible contrast ratios
- [x] Mobile-friendly tap targets (44px min)
- [x] Loading indicators
- [x] Empty state messages
- [x] Error feedback
- [x] Success confirmations

---

**Sprint 3 Visual Guide Complete** 📐  
**Professional Enterprise SaaS Design** 🎨  
**Consistent with Existing System** ✅
