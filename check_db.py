import sqlite3

conn = sqlite3.connect('backend/instance/campuspulse_dev.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("Tables in database:")
for table in tables:
    print(f"  - {table[0]}")
    
    # Show table structure
    cursor.execute(f"PRAGMA table_info({table[0]})")
    columns = cursor.fetchall()
    print("    Columns:")
    for col in columns:
        print(f"      {col[1]} ({col[2]})")
    
    # Count rows
    cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
    count = cursor.fetchone()[0]
    print(f"    Row count: {count}\n")

conn.close()
