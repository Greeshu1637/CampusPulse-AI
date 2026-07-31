# CampusPulse AI - Software Architecture Document

**Version:** 1.0  
**Date:** July 30, 2026  
**Status:** Architecture Review  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Overall Software Architecture](#2-overall-software-architecture)
3. [Production-Ready Folder Structure](#3-production-ready-folder-structure)
4. [Database Architecture](#4-database-architecture)
5. [API Architecture](#5-api-architecture)
6. [Authentication & Authorization Flow](#6-authentication--authorization-flow)
7. [Navigation Flow](#7-navigation-flow)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Backend Architecture](#9-backend-architecture)
10. [Machine Learning Pipeline](#10-machine-learning-pipeline)
11. [Development Roadmap](#11-development-roadmap)
12. [Risks & Mitigation](#12-risks--mitigation)
13. [Project Conventions](#13-project-conventions)
14. [Architectural Decisions & Rationale](#14-architectural-decisions--rationale)

---

## 1. Executive Summary

CampusPulse AI is a unified, role-based platform consolidating Girls Hostel Management and Academic Campus Operations into a single application with one dashboard. The architecture prioritizes:

- **Single Responsibility:** One app, one dashboard, role-based views
- **DRY Principles:** No duplicate CSS, JS, or pages
- **Modularity:** Component-based frontend, blueprint-based backend
- **Scalability:** Microservice-ready monolithic architecture
- **Maintainability:** Clear separation of concerns, comprehensive documentation

**Core Philosophy:** Build a monolithic application with microservice-ready architecture patterns.

---

## 2. Overall Software Architecture

### 2.1 Architecture Pattern: Layered Monolithic with Modular Blueprints

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Single Dashboard (Role-Based Dynamic Content)       │   │
│  │  - Component-based UI (Web Components)              │   │
│  │  - Shared CSS Framework (BEM Methodology)           │   │
│  │  - Shared JS Modules (ES6 Modules)                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Hostel     │  │   Academic   │  │    Admin     │     │
│  │   Blueprint  │  │   Blueprint  │  │   Blueprint  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │   Analytics  │  │      ML      │     │
│  │   Blueprint  │  │   Blueprint  │  │   Blueprint  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  │   Classes    │  │   Classes    │  │   Classes    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Repository  │  │  Repository  │  │  Repository  │     │
│  │   Pattern    │  │   Pattern    │  │   Pattern    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                  SQLAlchemy ORM                             │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│                    PostgreSQL Database                       │
└─────────────────────────────────────────────────────────────┘

         ┌────────────────────────────────────┐
         │      EXTERNAL SERVICES             │
         ├────────────────────────────────────┤
         │  - Google OAuth 2.0                │
         │  - Power BI (Embedded Analytics)   │
         │  - ML Model Storage                │
         └────────────────────────────────────┘
```

### 2.2 Key Architectural Principles

1. **Single Source of Truth:** One dashboard renders different content based on user role
2. **Separation of Concerns:** Each layer has a distinct responsibility
3. **Dependency Injection:** Services injected into blueprints for testability
4. **Repository Pattern:** Abstract database operations for flexibility
5. **Blueprint Modularity:** Each feature domain is an independent Flask blueprint
6. **Component-Based UI:** Reusable web components eliminate duplication
7. **API-First Design:** RESTful APIs enable future mobile app integration

---

## 3. Production-Ready Folder Structure

```
campuspulse-ai/
│
├── app/
│   ├── __init__.py                 # Flask app factory
│   ├── config.py                   # Configuration management
│   ├── extensions.py               # Flask extensions initialization
│   │
│   ├── blueprints/                 # Feature modules
│   │   ├── __init__.py
│   │   ├── auth/                   # Authentication & Authorization
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── services.py
│   │   │   └── decorators.py
│   │   │
│   │   ├── hostel/                 # Hostel Management
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── services.py
│   │   │   ├── mess_service.py
│   │   │   └── complaint_service.py
│   │   │
│   │   ├── academic/               # Academic Operations
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── services.py
│   │   │   └── classroom_service.py
│   │   │
│   │   ├── analytics/              # Analytics & Reporting
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   └── services.py
│   │   │
│   │   ├── admin/                  # Admin Operations
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   └── services.py
│   │   │
│   │   └── dashboard/              # Unified Dashboard
│   │       ├── __init__.py
│   │       ├── routes.py
│   │       └── services.py
│   │
│   ├── models/                     # SQLAlchemy Models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── hostel.py
│   │   ├── mess.py
│   │   ├── complaint.py
│   │   ├── classroom.py
│   │   └── analytics.py
│   │
│   ├── repositories/                # Data Access Layer
│   │   ├── __init__.py
│   │   ├── base_repository.py
│   │   ├── user_repository.py
│   │   ├── hostel_repository.py
│   │   └── classroom_repository.py
│   │
│   ├── ml/                         # Machine Learning
│   │   ├── __init__.py
│   │   ├── models/                 # Trained models
│   │   ├── food_waste_predictor.py
│   │   ├── occupancy_predictor.py
│   │   └── training_pipeline.py
│   │
│   ├── utils/                      # Shared Utilities
│   │   ├── __init__.py
│   │   ├── validators.py
│   │   ├── helpers.py
│   │   └── constants.py
│   │
│   └── static/                     # Frontend Assets
│       ├── css/
│       │   ├── core/               # Core framework
│       │   │   ├── reset.css
│       │   │   ├── variables.css
│       │   │   ├── typography.css
│       │   │   └── layout.css
│       │   ├── components/         # Reusable components
│       │   │   ├── buttons.css
│       │   │   ├── cards.css
│       │   │   ├── forms.css
│       │   │   ├── tables.css
│       │   │   └── modals.css
│       │   └── themes/
│       │       └── default.css
│       │
│       ├── js/
│       │   ├── core/               # Core modules
│       │   │   ├── app.js          # Main app initialization
│       │   │   ├── router.js       # Client-side routing
│       │   │   ├── api.js          # API client
│       │   │   └── auth.js         # Auth helpers
│       │   ├── components/         # Web Components
│       │   │   ├── dashboard-widget.js
│       │   │   ├── data-table.js
│       │   │   ├── chart-wrapper.js
│       │   │   └── notification.js
│       │   ├── modules/            # Feature modules
│       │   │   ├── hostel.js
│       │   │   ├── academic.js
│       │   │   └── analytics.js
│       │   └── utils/
│       │       ├── helpers.js
│       │       └── validators.js
│       │
│       └── assets/
│           ├── images/
│           └── icons/
│
├── app/templates/                  # Jinja2 Templates
│   ├── base.html                   # Base template
│   ├── dashboard.html              # Single unified dashboard
│   ├── auth/
│   │   ├── login.html
│   │   └── error.html
│   └── components/                 # Reusable template partials
│       ├── navbar.html
│       ├── sidebar.html
│       ├── footer.html
│       └── widgets/
│           ├── stat-card.html
│           ├── chart-widget.html
│           └── table-widget.html
│
├── migrations/                     # Alembic migrations
│   └── versions/
│
├── tests/                          # Test suite
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                        # Utility scripts
│   ├── init_db.py
│   ├── seed_data.py
│   └── train_models.py
│
├── docs/                           # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── .env.example                    # Environment variables template
├── .gitignore
├── requirements.txt                # Python dependencies
├── requirements-dev.txt            # Development dependencies
├── pytest.ini                      # Pytest configuration
├── alembic.ini                     # Alembic configuration
├── run.py                          # Application entry point
└── README.md

```

### 3.1 Folder Structure Rationale

- **`app/blueprints/`**: Each domain is isolated for independent development
- **`app/models/`**: Centralized data models for consistency
- **`app/repositories/`**: Abstracts database operations, enables testing with mocks
- **`app/static/css/core/`**: Shared CSS framework prevents duplication
- **`app/static/js/core/`**: Core modules loaded once, used everywhere
- **`app/static/js/components/`**: Web Components for reusable UI elements
- **`app/templates/components/`**: Server-side template partials for SSR
- **Single `dashboard.html`**: Role-based content rendering eliminates duplicate pages

---

## 4. Database Architecture

### 4.1 Entity-Relationship Overview

```
┌─────────────┐
│    User     │──────────┐
└─────────────┘          │
      │                  │
      │ 1:N              │ 1:N
      ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  Complaint  │    │ MessRating  │
└─────────────┘    └─────────────┘
                         │
                         │ N:1
                         ▼
                   ┌─────────────┐
                   │    Mess     │◄──────┐
                   └─────────────┘       │
                         │               │
                         │ 1:N           │ 1:1
                         ▼               │
                   ┌─────────────┐       │
                   │   MenuItem  │       │
                   └─────────────┘       │
                         │               │
                         │ 1:N           │
                         ▼               │
                   ┌─────────────┐       │
                   │FoodWasteLog │       │
                   └─────────────┘       │
                                         │
┌─────────────┐    ┌─────────────┐      │
│  Classroom  │───►│ Occupancy   │      │
└─────────────┘    │    Log      │      │
      │            └─────────────┘      │
      │ 1:N                             │
      ▼                                 │
┌─────────────┐                         │
│  Booking    │                         │
└─────────────┘                         │
                                        │
┌─────────────┐                         │
│   Hostel    │─────────────────────────┘
└─────────────┘
      │
      │ 1:N
      ▼
┌─────────────┐
│    Room     │
└─────────────┘
      │
      │ 1:N
      ▼
┌─────────────┐
│ RoomAlloc.  │
└─────────────┘
      │
      │ N:1
      ▼
┌─────────────┐
│    User     │
└─────────────┘
```

### 4.2 Core Tables

#### 4.2.1 Users & Authentication

```sql
users
  - id (PK)
  - google_id (UNIQUE, indexed)
  - email (UNIQUE, indexed)
  - name
  - role (ENUM: student, admin, mess_manager, hostel_manager)
  - profile_picture_url
  - is_active
  - created_at
  - updated_at
  - last_login_at
```

#### 4.2.2 Hostel Domain

```sql
hostels
  - id (PK)
  - name
  - address
  - capacity
  - warden_id (FK → users.id)
  - created_at
  
rooms
  - id (PK)
  - hostel_id (FK → hostels.id)
  - room_number
  - floor
  - capacity
  - room_type (ENUM: single, double, triple)
  
room_allocations
  - id (PK)
  - room_id (FK → rooms.id)
  - user_id (FK → users.id)
  - allocated_at
  - deallocated_at
  - is_active
  
complaints
  - id (PK)
  - user_id (FK → users.id)
  - hostel_id (FK → hostels.id)
  - category (ENUM: maintenance, cleanliness, food, safety, other)
  - title
  - description
  - status (ENUM: open, in_progress, resolved, closed)
  - priority (ENUM: low, medium, high, urgent)
  - assigned_to (FK → users.id)
  - created_at
  - updated_at
  - resolved_at
```

#### 4.2.3 Mess Domain

```sql
messes
  - id (PK)
  - hostel_id (FK → hostels.id)
  - name
  - manager_id (FK → users.id)
  - capacity
  
menu_items
  - id (PK)
  - mess_id (FK → messes.id)
  - name
  - category (ENUM: breakfast, lunch, snacks, dinner)
  - meal_type (ENUM: veg, non_veg, vegan)
  - day_of_week (0-6)
  - serving_date
  - estimated_quantity_kg
  - cost_per_serving
  
food_waste_logs
  - id (PK)
  - menu_item_id (FK → menu_items.id)
  - date
  - prepared_quantity_kg
  - consumed_quantity_kg
  - wasted_quantity_kg
  - wastage_percentage
  - recorded_by (FK → users.id)
  - created_at
  
mess_ratings
  - id (PK)
  - mess_id (FK → messes.id)
  - user_id (FK → users.id)
  - menu_item_id (FK → menu_items.id, nullable)
  - rating (1-5)
  - feedback
  - date
  - created_at
```

#### 4.2.4 Academic Domain

```sql
classrooms
  - id (PK)
  - building_name
  - room_number
  - floor
  - capacity
  - room_type (ENUM: lecture_hall, lab, seminar, tutorial)
  - has_projector
  - has_ac
  - has_wifi
  - is_accessible
  
classroom_occupancy_logs
  - id (PK)
  - classroom_id (FK → classrooms.id)
  - timestamp
  - occupancy_count
  - capacity_percentage
  - sensor_id (for IoT integration)
  
classroom_bookings
  - id (PK)
  - classroom_id (FK → classrooms.id)
  - booked_by (FK → users.id)
  - purpose
  - start_time
  - end_time
  - status (ENUM: pending, approved, rejected, cancelled)
  - created_at
```

#### 4.2.5 Analytics & Audit

```sql
analytics_snapshots
  - id (PK)
  - metric_type (ENUM: hostel_occupancy, mess_wastage, classroom_utilization)
  - entity_id (polymorphic reference)
  - entity_type (hostel, mess, classroom)
  - value
  - timestamp
  - metadata (JSONB for flexible data)
  
audit_logs
  - id (PK)
  - user_id (FK → users.id)
  - action (ENUM: create, update, delete, login, logout)
  - entity_type
  - entity_id
  - changes (JSONB)
  - ip_address
  - timestamp
```

### 4.3 Indexing Strategy

```sql
-- Performance-critical indexes
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_food_waste_date ON food_waste_logs(date DESC);
CREATE INDEX idx_occupancy_timestamp ON classroom_occupancy_logs(timestamp DESC);
CREATE INDEX idx_analytics_metric_type_timestamp ON analytics_snapshots(metric_type, timestamp DESC);
```

### 4.4 Database Architecture Decisions

1. **Normalized Design:** 3NF to minimize redundancy
2. **JSONB for Flexibility:** Metadata fields for extensibility without schema changes
3. **Soft Deletes:** `is_active` flags instead of hard deletes for audit trails
4. **Timestamps:** All tables have `created_at`, critical tables have `updated_at`
5. **Enums:** Database-level enums for data integrity
6. **Polymorphic Relations:** `analytics_snapshots` uses entity_type/entity_id pattern
7. **Composite Indexes:** Multi-column indexes for common query patterns

---

## 5. API Architecture

### 5.1 RESTful API Design

**Base URL:** `/api/v1`

**Authentication:** Bearer Token (JWT) after OAuth 2.0 authentication

### 5.2 API Endpoints

#### 5.2.1 Authentication
```
POST   /api/v1/auth/google/login      # Initiate Google OAuth
GET    /api/v1/auth/google/callback   # OAuth callback
POST   /api/v1/auth/logout             # Logout
GET    /api/v1/auth/me                 # Get current user
```

#### 5.2.2 Dashboard
```
GET    /api/v1/dashboard               # Get role-based dashboard data
GET    /api/v1/dashboard/widgets       # Get available widgets for role
```

#### 5.2.3 Hostel Management
```
GET    /api/v1/hostels                 # List hostels
GET    /api/v1/hostels/:id             # Get hostel details
POST   /api/v1/hostels                 # Create hostel (admin only)
PUT    /api/v1/hostels/:id             # Update hostel (admin only)

GET    /api/v1/hostels/:id/rooms       # List rooms
GET    /api/v1/hostels/:id/occupancy   # Get occupancy stats

GET    /api/v1/complaints              # List complaints (filtered by role)
POST   /api/v1/complaints              # Create complaint
PUT    /api/v1/complaints/:id          # Update complaint status
GET    /api/v1/complaints/:id          # Get complaint details
```

#### 5.2.4 Mess Management
```
GET    /api/v1/messes                  # List messes
GET    /api/v1/messes/:id              # Get mess details
GET    /api/v1/messes/:id/menu         # Get menu (by date/week)
POST   /api/v1/messes/:id/menu         # Add menu item (mess_manager)
PUT    /api/v1/messes/:id/menu/:itemId # Update menu item

POST   /api/v1/messes/:id/ratings      # Submit rating
GET    /api/v1/messes/:id/ratings      # Get ratings

POST   /api/v1/messes/:id/waste-logs   # Log food waste (mess_manager)
GET    /api/v1/messes/:id/waste-logs   # Get waste logs
GET    /api/v1/messes/:id/waste-prediction # Get ML prediction
```

#### 5.2.5 Academic Operations
```
GET    /api/v1/classrooms              # List classrooms (with filters)
GET    /api/v1/classrooms/:id          # Get classroom details
GET    /api/v1/classrooms/available    # Find available classrooms
GET    /api/v1/classrooms/:id/occupancy # Get occupancy data

POST   /api/v1/classrooms/:id/bookings # Create booking
GET    /api/v1/classrooms/:id/bookings # Get bookings
PUT    /api/v1/classrooms/bookings/:id # Update booking status
```

#### 5.2.6 Analytics
```
GET    /api/v1/analytics/hostel        # Hostel analytics
GET    /api/v1/analytics/mess          # Mess analytics
GET    /api/v1/analytics/academic      # Campus analytics
GET    /api/v1/analytics/overview      # Overall dashboard metrics
GET    /api/v1/analytics/export        # Export data (CSV/JSON)
```

#### 5.2.7 Admin
```
GET    /api/v1/admin/users             # List all users
PUT    /api/v1/admin/users/:id         # Update user role/status
GET    /api/v1/admin/audit-logs        # Get audit logs
GET    /api/v1/admin/system-health     # System health metrics
```

### 5.3 API Response Format

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "meta": {
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### 5.4 API Security

1. **Authentication:** JWT tokens with 24-hour expiry
2. **Authorization:** Role-based middleware on every protected route
3. **Rate Limiting:** 100 requests/minute per user
4. **CORS:** Whitelist specific origins only
5. **Input Validation:** Marshmallow schemas for all inputs
6. **SQL Injection Prevention:** SQLAlchemy ORM parameterized queries
7. **XSS Prevention:** Content Security Policy headers

---

## 6. Authentication & Authorization Flow

### 6.1 Authentication Flow (Google OAuth 2.0)

```
┌─────────┐                                  ┌─────────────┐
│  User   │                                  │  CampusPulse│
│ Browser │                                  │   Backend   │
└────┬────┘                                  └──────┬──────┘
     │                                              │
     │  1. Click "Login with Google"                │
     ├─────────────────────────────────────────────►│
     │                                              │
     │  2. Redirect to Google OAuth                 │
     │◄─────────────────────────────────────────────┤
     │                                              │
     │  ┌──────────────────────────────────────┐   │
     │  │  Google OAuth 2.0 Authorization       │   │
     │  │  - User selects Google account        │   │
     │  │  - Grants permissions                 │   │
     │  └──────────────────────────────────────┘   │
     │                                              │
     │  3. Google redirects with auth code          │
     ├─────────────────────────────────────────────►│
     │                                              │
     │                                              │  4. Exchange code
     │                                              │     for access token
     │                                              ├──────────┐
     │                                              │          │ Google
     │                                              │◄─────────┘ API
     │                                              │
     │                                              │  5. Get user profile
     │                                              ├──────────┐
     │                                              │          │ Google
     │                                              │◄─────────┘ API
     │                                              │
     │                                              │  6. Create/Update
     │                                              │     user in DB
     │                                              ├──────────┐
     │                                              │          │
     │                                              │◄─────────┘
     │                                              │
     │                                              │  7. Generate JWT
     │                                              ├──────────┐
     │                                              │          │
     │                                              │◄─────────┘
     │                                              │
     │  8. Return JWT + User data                   │
     │◄─────────────────────────────────────────────┤
     │                                              │
     │  9. Store JWT in httpOnly cookie             │
     │     + localStorage for API calls             │
     │                                              │
     │  10. Redirect to dashboard                   │
     ├─────────────────────────────────────────────►│
     │                                              │
```

### 6.2 Authorization Matrix

| Feature                        | Student | Mess Manager | Hostel Manager | Admin |
|--------------------------------|---------|--------------|----------------|-------|
| **Dashboard**                  |         |              |                |       |
| View own dashboard             | ✓       | ✓            | ✓              | ✓     |
| View all dashboards            | ✗       | ✗            | ✗              | ✓     |
| **Hostel**                     |         |              |                |       |
| View hostel info               | ✓       | ✓            | ✓              | ✓     |
| Create complaint               | ✓       | ✗            | ✗              | ✓     |
| View own complaints            | ✓       | ✗            | ✗              | ✓     |
| View all complaints            | ✗       | ✗            | ✓              | ✓     |
| Update complaint status        | ✗       | ✗            | ✓              | ✓     |
| Manage rooms                   | ✗       | ✗            | ✓              | ✓     |
| **Mess**                       |         |              |                |       |
| View menu                      | ✓       | ✓            | ✓              | ✓     |
| Submit rating                  | ✓       | ✗            | ✗              | ✗     |
| Manage menu                    | ✗       | ✓            | ✗              | ✓     |
| Log food waste                 | ✗       | ✓            | ✗              | ✓     |
| View waste analytics           | ✗       | ✓            | ✓              | ✓     |
| **Academic**                   |         |              |                |       |
| Find classrooms                | ✓       | ✗            | ✗              | ✓     |
| View occupancy                 | ✓       | ✗            | ✗              | ✓     |
| Book classroom                 | ✓       | ✗            | ✗              | ✓     |
| Approve bookings               | ✗       | ✗            | ✗              | ✓     |
| **Admin**                      |         |              |                |       |
| Manage users                   | ✗       | ✗            | ✗              | ✓     |
| View audit logs                | ✗       | ✗            | ✗              | ✓     |
| System configuration           | ✗       | ✗            | ✗              | ✓     |

### 6.3 Authorization Implementation

```python
# Decorator-based authorization
@require_role(['admin', 'hostel_manager'])
def update_complaint(complaint_id):
    # Only admin and hostel_manager can update
    pass

@require_role(['student'], allow_self=True)
def view_complaint(complaint_id):
    # Students can only view their own complaints
    pass
```

---

## 7. Navigation Flow

### 7.1 Application Routes

```
/                              → Landing page (if not authenticated)
                               → Redirect to /dashboard (if authenticated)

/auth/login                    → Google OAuth initiation
/auth/callback                 → OAuth callback handler
/auth/logout                   → Logout and clear session

/dashboard                     → Single unified dashboard (role-based content)

/hostel                        → Hostel overview (redirects to dashboard)
/hostel/complaints             → Complaint management (student: create/view own)
/hostel/complaints/:id         → Complaint details
/hostel/rooms                  → Room management (hostel_manager, admin)

/mess                          → Mess overview (redirects to dashboard)
/mess/menu                     → View menu
/mess/ratings                  → Submit ratings (student)
/mess/waste-logs               → Food waste logs (mess_manager)
/mess/analytics                → Waste analytics (mess_manager, admin)

/academic                      → Academic overview (redirects to dashboard)
/academic/classrooms           → Classroom finder
/academic/classrooms/:id       → Classroom details
/academic/bookings             → Booking management

/analytics                     → Analytics hub (role-based views)
/analytics/hostel              → Hostel analytics
/analytics/mess                → Mess analytics
/analytics/campus              → Campus analytics

/admin                         → Admin panel (admin only)
/admin/users                   → User management
/admin/audit-logs              → Audit logs
/admin/system                  → System configuration

/profile                       → User profile
/settings                      → User preferences

/404                           → Not found page
/403                           → Forbidden page
/500                           → Error page
```

### 7.2 Dashboard Navigation Structure

```
┌────────────────────────────────────────────────────────────┐
│  CAMPUSPULSE AI                  [User Avatar] [Logout]    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────────────────────────────────┐   │
│  │          │  │                                       │   │
│  │ SIDEBAR  │  │        MAIN CONTENT AREA             │   │
│  │          │  │     (Role-Based Dynamic Widgets)     │   │
│  │ - Home   │  │                                       │   │
│  │ - Hostel │  │  ┌─────────┐  ┌─────────┐           │   │
│  │ - Mess   │  │  │ Widget  │  │ Widget  │           │   │
│  │ - Campus │  │  │    1    │  │    2    │           │   │
│  │ - Analyt.│  │  └─────────┘  └─────────┘           │   │
│  │ - Admin* │  │                                       │   │
│  │          │  │  ┌─────────┐  ┌─────────┐           │   │
│  │ *conditio│  │  │ Widget  │  │ Widget  │           │   │
│  │  nal     │  │  │    3    │  │    4    │           │   │
│  └──────────┘  │  └─────────┘  └─────────┘           │   │
│                │                                       │   │
│                └───────────────────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 7.3 User Journey Examples

#### Student Journey
```
1. Login → Dashboard
2. Dashboard shows:
   - Hostel info widget
   - Mess menu widget
   - Classroom finder widget
   - Complaint status widget
3. Click "Mess" → View today's menu
4. Click "Rate Food" → Submit rating
5. Click "Hostel" → View complaints
6. Click "New Complaint" → Create complaint
7. Click "Campus" → Find available classrooms
```

#### Mess Manager Journey
```
1. Login → Dashboard
2. Dashboard shows:
   - Today's menu widget
   - Waste statistics widget
   - Rating trends widget
   - Food waste prediction widget
3. Click "Menu" → Update menu
4. Click "Waste Log" → Record waste data
5. Click "Analytics" → View waste trends & ML predictions
```

#### Admin Journey
```
1. Login → Dashboard
2. Dashboard shows:
   - System overview widget
   - All complaints widget
   - Hostel occupancy widget
   - Classroom utilization widget
   - Recent audit logs widget
3. Click "Admin" → User management
4. Click "Analytics" → System-wide analytics with Power BI embed
5. Click "Audit Logs" → Review system activity
```

---

## 8. Frontend Architecture

### 8.1 Component-Based Architecture

**Philosophy:** Build once, use everywhere with Web Components

#### 8.1.1 Web Components Structure

```javascript
// Example: Dashboard Widget Component
class DashboardWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
  }
  
  static get observedAttributes() {
    return ['title', 'type', 'data-url'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
}
customElements.define('dashboard-widget', DashboardWidget);
```

#### Usage in HTML
```html
<dashboard-widget 
  title="Complaint Status" 
  type="chart"
  data-url="/api/v1/analytics/complaints">
</dashboard-widget>
```

### 8.2 CSS Architecture (BEM Methodology)

**Block-Element-Modifier Pattern:**

```css
/* Block */
.dashboard-widget { }

/* Element */
.dashboard-widget__header { }
.dashboard-widget__title { }
.dashboard-widget__content { }

/* Modifier */
.dashboard-widget--loading { }
.dashboard-widget--error { }
```

**CSS Organization:**

1. **Core Layer:** Variables, reset, typography, layout grid
2. **Component Layer:** Reusable UI components (buttons, cards, tables)
3. **Module Layer:** Feature-specific styles
4. **Theme Layer:** Color schemes, dark mode

**No Duplication Strategy:**
- All colors, spacing, fonts defined in CSS variables
- Utility classes for common patterns
- Component-scoped styles using Web Component Shadow DOM

### 8.3 JavaScript Architecture

#### 8.3.1 Module Pattern

```javascript
// app/static/js/core/app.js
const App = {
  config: {},
  user: null,
  
  init() {
    this.loadConfig();
    this.initRouter();
    this.loadUser();
    this.registerComponents();
  },
  
  loadUser() {
    // Fetch current user from /api/v1/auth/me
  },
  
  registerComponents() {
    // Register all Web Components
  }
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => App.init());
```

#### 8.3.2 API Client Module

```javascript
// app/static/js/core/api.js
const API = {
  baseURL: '/api/v1',
  
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
```

#### 8.3.3 Router Module (Client-Side)

```javascript
// app/static/js/core/router.js
const Router = {
  routes: {},
  
  register(path, handler) {
    this.routes[path] = handler;
  },
  
  navigate(path) {
    history.pushState(null, '', path);
    this.resolve();
  },
  
  resolve() {
    const path = window.location.pathname;
    const handler = this.routes[path] || this.routes['/404'];
    if (handler) handler();
  }
};
```

### 8.4 Chart.js Integration

```javascript
// app/static/js/components/chart-wrapper.js
class ChartWrapper extends HTMLElement {
  async connectedCallback() {
    const data = await API.get(this.getAttribute('data-url'));
    const ctx = this.querySelector('canvas').getContext('2d');
    
    new Chart(ctx, {
      type: this.getAttribute('chart-type'),
      data: data,
      options: this.getChartOptions()
    });
  }
}
customElements.define('chart-wrapper', ChartWrapper);
```

**Usage:**
```html
<chart-wrapper 
  chart-type="line"
  data-url="/api/v1/analytics/waste-trends">
  <canvas></canvas>
</chart-wrapper>
```

### 8.5 Progressive Enhancement Strategy

1. **Base:** Server-rendered HTML works without JavaScript
2. **Enhanced:** JavaScript adds interactivity and real-time updates
3. **Optimized:** Service workers for offline capability (future sprint)

---

## 9. Backend Architecture

### 9.1 Flask Application Factory Pattern

```python
# app/__init__.py
def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    # Register blueprints
    from app.blueprints.auth import auth_bp
    from app.blueprints.dashboard import dashboard_bp
    from app.blueprints.hostel import hostel_bp
    from app.blueprints.academic import academic_bp
    from app.blueprints.analytics import analytics_bp
    from app.blueprints.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(hostel_bp, url_prefix='/api/v1/hostels')
    app.register_blueprint(academic_bp, url_prefix='/api/v1/academic')
    app.register_blueprint(analytics_bp, url_prefix='/api/v1/analytics')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')
    
    # Register error handlers
    register_error_handlers(app)
    
    return app
```

### 9.2 Service Layer Pattern

```python
# app/blueprints/hostel/services.py
class ComplaintService:
    def __init__(self):
        self.repository = ComplaintRepository()
    
    def create_complaint(self, user_id, data):
        # Business logic
        complaint = self.repository.create({
            'user_id': user_id,
            'hostel_id': data['hostel_id'],
            'category': data['category'],
            'title': data['title'],
            'description': data['description'],
            'status': 'open',
            'priority': self._calculate_priority(data)
        })
        
        # Send notification
        NotificationService.send_complaint_created(complaint)
        
        # Log audit
        AuditService.log('create', 'complaint', complaint.id, user_id)
        
        return complaint
    
    def _calculate_priority(self, data):
        # Business rule: urgent keywords
        urgent_keywords = ['emergency', 'urgent', 'danger']
        if any(kw in data['description'].lower() for kw in urgent_keywords):
            return 'urgent'
        return 'medium'
```

### 9.3 Repository Pattern

```python
# app/repositories/base_repository.py
class BaseRepository:
    model = None
    
    def create(self, data):
        instance = self.model(**data)
        db.session.add(instance)
        db.session.commit()
        return instance
    
    def get_by_id(self, id):
        return self.model.query.get(id)
    
    def update(self, id, data):
        instance = self.get_by_id(id)
        for key, value in data.items():
            setattr(instance, key, value)
        db.session.commit()
        return instance
    
    def delete(self, id):
        instance = self.get_by_id(id)
        db.session.delete(instance)
        db.session.commit()

# app/repositories/complaint_repository.py
class ComplaintRepository(BaseRepository):
    model = Complaint
    
    def get_by_user(self, user_id, filters=None):
        query = self.model.query.filter_by(user_id=user_id)
        if filters:
            query = self._apply_filters(query, filters)
        return query.all()
```

### 9.4 Blueprint Structure

```python
# app/blueprints/hostel/routes.py
from flask import Blueprint, request, jsonify
from app.blueprints.auth.decorators import login_required, role_required
from .services import ComplaintService

hostel_bp = Blueprint('hostel', __name__)
complaint_service = ComplaintService()

@hostel_bp.route('/complaints', methods=['GET'])
@login_required
def get_complaints():
    user = request.current_user
    
    # Role-based filtering
    if user.role == 'student':
        complaints = complaint_service.get_user_complaints(user.id)
    elif user.role in ['hostel_manager', 'admin']:
        complaints = complaint_service.get_all_complaints(request.args)
    
    return jsonify({
        'success': True,
        'data': [c.to_dict() for c in complaints]
    })

@hostel_bp.route('/complaints', methods=['POST'])
@login_required
@role_required(['student', 'admin'])
def create_complaint():
    data = request.get_json()
    
    # Validate
    errors = ComplaintValidator.validate(data)
    if errors:
        return jsonify({'success': False, 'error': errors}), 400
    
    complaint = complaint_service.create_complaint(
        request.current_user.id, 
        data
    )
    
    return jsonify({
        'success': True,
        'data': complaint.to_dict(),
        'message': 'Complaint created successfully'
    }), 201
```

### 9.5 Configuration Management

```python
# app/config.py
import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Power BI
    POWERBI_WORKSPACE_ID = os.environ.get('POWERBI_WORKSPACE_ID')
    POWERBI_REPORT_ID = os.environ.get('POWERBI_REPORT_ID')

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

### 9.6 Error Handling

```python
# app/errors.py
from flask import jsonify

def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Resource not found'
            }
        }), 404
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'Access denied'
            }
        }), 403
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Internal server error'
            }
        }), 500
```

---

## 10. Machine Learning Pipeline

### 10.1 Food Waste Prediction Model

#### 10.1.1 Features
```python
Features = [
    'day_of_week',          # 0-6 (Monday-Sunday)
    'meal_type',            # 0: breakfast, 1: lunch, 2: dinner
    'menu_category',        # 0: veg, 1: non-veg, 2: vegan
    'historical_avg_waste', # Average waste for this item (last 30 days)
    'weather_temp',         # Temperature (future integration)
    'is_holiday',           # 0 or 1
    'semester_week',        # Week number in semester (1-16)
    'prepared_quantity'     # Quantity prepared
]

Target = 'wasted_quantity_kg'
```

#### 10.1.2 Model Architecture
```
Algorithm: Random Forest Regressor
- n_estimators: 100
- max_depth: 10
- min_samples_split: 5

Training Pipeline:
1. Load historical food_waste_logs (minimum 3 months data)
2. Feature engineering (day_of_week, rolling averages)
3. Train-test split (80-20)
4. Cross-validation (5-fold)
5. Hyperparameter tuning (GridSearchCV)
6. Model evaluation (MAE, RMSE, R²)
7. Model persistence (joblib)
```

#### 10.1.3 Prediction API Flow
```python
# app/ml/food_waste_predictor.py
class FoodWastePredictor:
    def __init__(self):
        self.model = joblib.load('app/ml/models/food_waste_model.pkl')
        self.scaler = joblib.load('app/ml/models/scaler.pkl')
    
    def predict(self, menu_item, date, prepared_quantity):
        features = self._extract_features(menu_item, date, prepared_quantity)
        features_scaled = self.scaler.transform([features])
        prediction = self.model.predict(features_scaled)[0]
        
        # Add confidence interval
        confidence = self._calculate_confidence(features)
        
        return {
            'predicted_waste_kg': round(prediction, 2),
            'confidence': confidence,
            'recommendation': self._generate_recommendation(prediction, prepared_quantity)
        }
    
    def _generate_recommendation(self, predicted_waste, prepared_quantity):
        waste_percentage = (predicted_waste / prepared_quantity) * 100
        
        if waste_percentage > 20:
            return f"High waste predicted ({waste_percentage:.1f}%). Consider reducing quantity by {int(predicted_waste * 0.8)}kg"
        elif waste_percentage > 10:
            return f"Moderate waste predicted. Monitor closely."
        else:
            return f"Low waste predicted. Current quantity optimal."
```

### 10.2 Classroom Occupancy Prediction

#### 10.2.1 Features
```python
Features = [
    'hour_of_day',          # 0-23
    'day_of_week',          # 0-6
    'classroom_capacity',   # Number
    'classroom_type',       # Encoded
    'is_exam_week',         # 0 or 1
    'semester_week',        # 1-16
    'prev_hour_occupancy'   # Previous hour's occupancy
]

Target = 'occupancy_percentage'
```

#### 10.2.2 Model Architecture
```
Algorithm: Gradient Boosting Regressor
- n_estimators: 150
- learning_rate: 0.1
- max_depth: 6

Real-time Prediction:
- Updated every 15 minutes
- Sliding window of last 7 days
- Online learning capability for model updates
```

### 10.3 Model Training & Deployment Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  1. DATA COLLECTION                                     │
│     - Food waste logs (daily)                           │
│     - Occupancy logs (15-min intervals)                 │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. DATA PREPROCESSING                                  │
│     - Handle missing values                             │
│     - Feature engineering                               │
│     - Normalization                                     │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. MODEL TRAINING                                      │
│     - Train on historical data                          │
│     - Cross-validation                                  │
│     - Hyperparameter tuning                             │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. MODEL EVALUATION                                    │
│     - Test set performance                              │
│     - Metrics: MAE, RMSE, R²                            │
│     - If performance < threshold → Retrain              │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. MODEL DEPLOYMENT                                    │
│     - Save model (joblib)                               │
│     - Version control (model_v1.pkl, model_v2.pkl)      │
│     - Load in Flask app                                 │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  6. PREDICTION API                                      │
│     - /api/v1/ml/predict-waste                          │
│     - /api/v1/ml/predict-occupancy                      │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  7. MONITORING & RETRAINING                             │
│     - Track prediction accuracy                         │
│     - Retrain monthly with new data                     │
│     - A/B testing for model versions                    │
└─────────────────────────────────────────────────────────┘
```

### 10.4 Model Retraining Strategy

1. **Scheduled Retraining:** Monthly batch retraining
2. **Triggered Retraining:** If prediction accuracy drops below 85%
3. **Incremental Learning:** Update model with new data weekly
4. **Version Control:** Keep last 3 model versions for rollback

---

## 11. Development Roadmap

### Sprint Structure: 2-week sprints, 6 sprints total (12 weeks)

---

### **Sprint 1: Foundation & Authentication (Weeks 1-2)**

**Goals:**
- Project setup and infrastructure
- Database design and initialization
- Google OAuth 2.0 integration
- Basic user management

**Deliverables:**
- [ ] Project folder structure created
- [ ] PostgreSQL database setup with initial schema
- [ ] SQLAlchemy models for User, Audit Log
- [ ] Flask app factory with blueprints structure
- [ ] Google OAuth 2.0 login flow working
- [ ] JWT-based session management
- [ ] Role-based authorization decorators
- [ ] Basic landing page + login page
- [ ] Environment configuration (.env setup)
- [ ] Git repository initialized with proper .gitignore

**Technical Tasks:**
- Setup virtual environment and install dependencies
- Create database migrations using Alembic
- Implement auth blueprint with OAuth callbacks
- Write unit tests for authentication flow
- Setup development and production configs

**Success Criteria:**
- User can login with Google account
- User roles are assigned correctly
- JWT tokens are generated and validated
- Authorization decorators restrict access properly

---

### **Sprint 2: Core Database & Dashboard (Weeks 3-4)**

**Goals:**
- Complete database schema implementation
- Build unified dashboard with role-based views
- Create shared frontend components
- Implement basic API structure

**Deliverables:**
- [ ] All database models implemented (Hostel, Mess, Classroom, Complaint, etc.)
- [ ] Repository pattern for all models
- [ ] Database seeding script with sample data
- [ ] Unified dashboard page (single HTML)
- [ ] Dashboard blueprint with role-based rendering
- [ ] Core CSS framework (variables, reset, layout, typography)
- [ ] Reusable CSS components (buttons, cards, forms, tables)
- [ ] Base JavaScript modules (app.js, api.js, router.js)
- [ ] Web Components: dashboard-widget, data-table
- [ ] Navigation sidebar with role-based menu items

**Technical Tasks:**
- Write Alembic migrations for all tables
- Implement BaseRepository with CRUD operations
- Create DashboardService for aggregating role-based data
- Build responsive grid layout system
- Implement BEM naming convention for CSS
- Setup Chart.js integration

**Success Criteria:**
- All tables created with proper relationships and indexes
- Students see student-specific widgets
- Admins see admin-specific widgets
- CSS is modular with no duplication
- Dashboard loads data from API endpoints

---

### **Sprint 3: Hostel Management (Weeks 5-6)**

**Goals:**
- Implement hostel and room management
- Build complaint system
- Create hostel analytics

**Deliverables:**
- [ ] Hostel API endpoints (CRUD)
- [ ] Room management (admin/hostel_manager)
- [ ] Room allocation system
- [ ] Complaint creation (student)
- [ ] Complaint management (hostel_manager)
- [ ] Complaint status workflow (open → in_progress → resolved)
- [ ] Complaint priority system
- [ ] Hostel analytics dashboard widget
- [ ] Occupancy tracking and visualization
- [ ] Email/in-app notifications for complaints

**Technical Tasks:**
- Build HostelService and ComplaintService
- Implement complaint filtering and pagination
- Create hostel analytics queries
- Build Chart.js visualizations for occupancy
- Write unit tests for complaint workflow

**Success Criteria:**
- Students can create and track complaints
- Hostel managers can view and update all complaints
- Priority is auto-calculated based on keywords
- Hostel occupancy is displayed accurately
- Analytics show trends over time

---

### **Sprint 4: Mess Management & ML (Weeks 7-8)**

**Goals:**
- Implement mess and menu management
- Build food waste logging system
- Develop food waste prediction ML model
- Integrate mess ratings

**Deliverables:**
- [ ] Mess API endpoints
- [ ] Menu management (mess_manager)
- [ ] Weekly menu display (all users)
- [ ] Food waste logging (mess_manager)
- [ ] Mess rating system (students)
- [ ] Food waste prediction model (Random Forest)
- [ ] Model training pipeline script
- [ ] ML prediction API endpoint
- [ ] Waste analytics dashboard
- [ ] Waste reduction recommendations

**Technical Tasks:**
- Build MessService and menu scheduling logic
- Collect and prepare historical waste data (if available, else generate synthetic)
- Train Random Forest model for waste prediction
- Implement FoodWastePredictor class
- Create waste trend visualizations
- Write model evaluation tests

**Success Criteria:**
- Mess managers can log daily food waste
- Students can rate meals
- ML model predicts waste with >80% accuracy
- Dashboard shows waste trends and predictions
- Recommendations are actionable

---

### **Sprint 5: Academic Operations (Weeks 9-10)**

**Goals:**
- Implement classroom management
- Build classroom finder
- Develop occupancy tracking
- Create booking system

**Deliverables:**
- [ ] Classroom API endpoints
- [ ] Classroom finder with filters (capacity, type, amenities)
- [ ] Real-time occupancy display
- [ ] Classroom booking system (students)
- [ ] Booking approval workflow (admin)
- [ ] Occupancy prediction model (Gradient Boosting)
- [ ] Campus analytics dashboard
- [ ] Classroom utilization reports

**Technical Tasks:**
- Build ClassroomService
- Implement advanced search with filters
- Create occupancy logging mechanism (simulated or IoT)
- Train occupancy prediction model
- Build booking calendar visualization
- Implement conflict detection for bookings

**Success Criteria:**
- Students can find available classrooms
- Occupancy data is displayed in real-time
- Bookings are conflict-free
- ML model predicts occupancy patterns
- Utilization analytics help optimize classroom usage

---

### **Sprint 6: Analytics, Admin & Polish (Weeks 11-12)**

**Goals:**
- Build comprehensive analytics hub
- Implement admin panel
- Integrate Power BI
- Production deployment preparation
- Testing and bug fixes

**Deliverables:**
- [ ] Analytics hub with hostel, mess, and campus analytics
- [ ] Power BI embedded reports
- [ ] Export functionality (CSV, JSON, PDF)
- [ ] Admin user management interface
- [ ] Audit log viewer
- [ ] System health monitoring
- [ ] Comprehensive unit tests (>80% coverage)
- [ ] Integration tests for critical workflows
- [ ] API documentation (Swagger/OpenAPI)
- [ ] User guide and admin documentation
- [ ] Production deployment checklist
- [ ] Performance optimization
- [ ] Security audit

**Technical Tasks:**
- Integrate Power BI REST API
- Build analytics aggregation queries
- Implement data export with Pandas
- Create admin dashboard views
- Write comprehensive test suite
- Setup CI/CD pipeline (GitHub Actions)
- Configure production server (Gunicorn, Nginx)
- Implement rate limiting and security headers
- Database query optimization with EXPLAIN ANALYZE
- Frontend performance optimization (minification, lazy loading)

**Success Criteria:**
- All analytics visualizations work correctly
- Power BI reports are embedded and interactive
- Admin can manage all users and view audit logs
- Test coverage >80%
- API is fully documented
- Application passes security audit
- Production deployment is successful
- Performance benchmarks are met (page load <2s, API response <200ms)

---

### Post-Launch Roadmap (Future Enhancements)

**Phase 2 (Months 4-6):**
- Mobile app (React Native)
- Push notifications
- Advanced reporting with custom date ranges
- IoT sensor integration for real classroom occupancy
- Automated complaint routing with NLP
- Multi-language support

**Phase 3 (Months 7-12):**
- Visitor management system
- Asset tracking
- Attendance tracking integration
- Payment gateway for mess fees
- Chatbot support (GPT-based)
- Advanced predictive analytics (student behavior patterns)

---
