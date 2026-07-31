# CampusPulse AI - Quick Start Guide

## Sprint 1: Foundation

Follow these steps to get CampusPulse AI running in 5 minutes.

---

## Prerequisites Checklist

- [ ] Python 3.9+ installed
- [ ] PostgreSQL 13+ installed and running
- [ ] Git installed

---

## Quick Setup (5 Steps)

### 1️⃣ Setup Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE campuspulse_ai;
\q
```

### 4️⃣ Configure Environment

```bash
# Copy template (Windows)
copy .env.example .env

# Copy template (Mac/Linux)
cp .env.example .env
```

**Edit `.env`:**
```env
FLASK_ENV=development
SECRET_KEY=dev-secret-key-12345
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/campuspulse_ai
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 5️⃣ Initialize & Run

```bash
# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Run application
python run.py
```

---

## Verify It's Working

**Open browser:** `http://localhost:5000/`

**Expected output:**
```
CampusPulse AI is Running
```

---

## ✅ Sprint 1 Complete!

You now have:
- Flask application running
- PostgreSQL database connected
- Application factory pattern configured
- Migration system ready

---

## Next Steps

Sprint 1 is complete. Wait for Sprint 2 requirements.

---

## Troubleshooting

**Can't connect to database?**
- Check PostgreSQL is running: `sc query postgresql`
- Verify password in `.env` is correct

**Module not found?**
- Activate virtual environment: `venv\Scripts\activate`
- Reinstall: `pip install -r requirements.txt`

**Flask commands not working?**
- Make sure you're in project root directory
- Virtual environment must be activated

---

**Need detailed help?** See `README.md`
