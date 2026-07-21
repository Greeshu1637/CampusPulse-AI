import pandas as pd
from database import get_connection

# Read complaints CSV (used temporarily until everything moves to PostgreSQL)
complaints_df = pd.read_csv("backend/data_files/complaints.csv")


def load_dashboard_data():
    # Read dashboard summary CSV
    df = pd.read_csv("backend/data_files/dashboard.csv")

    dashboard_data = {
        "students": int(df.loc[df["Metric"] == "Students", "Value"].values[0]),
        "complaints": int(df.loc[df["Metric"] == "Complaints", "Value"].values[0]),
        "mess": df.loc[df["Metric"] == "Mess Satisfaction", "Value"].values[0],
        "rooms": int(df.loc[df["Metric"] == "Empty Rooms", "Value"].values[0])
    }

    # ---------------- KPIs ----------------

    dashboard_data["complaint_rate"] = round(
        (dashboard_data["complaints"] / dashboard_data["students"]) * 100,
        2
    )

    dashboard_data["room_availability"] = round(
        (dashboard_data["rooms"] / 50) * 100,
        2
    )

    dashboard_data["total_complaints"] = len(complaints_df)

    dashboard_data["pending_complaints"] = (
        complaints_df["Status"] == "Pending"
    ).sum()

    dashboard_data["resolved_complaints"] = (
        complaints_df["Status"] == "Resolved"
    ).sum()

    return dashboard_data


def load_complaint_statistics():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT status, COUNT(*)
        FROM complaints
        GROUP BY status
    """)

    rows = cursor.fetchall()

    stats = {
        "Pending": 0,
        "Resolved": 0
    }

    for status, count in rows:
        stats[status] = count

    cursor.close()
    conn.close()

    return stats
def load_category_statistics():

    conn = get_connection()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT category, COUNT(*)
        FROM complaints
        GROUP BY category
        ORDER BY category
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows


def load_dashboard_summary():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM complaints")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM complaints WHERE status='Resolved'")
    resolved = cursor.fetchone()[0]

    cursor.execute("""
        SELECT category, COUNT(*)
        FROM complaints
        GROUP BY category
        ORDER BY COUNT(*) DESC
        LIMIT 1
    """)

    top_category = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    resolved_percentage = round((resolved / total) * 100, 2)

    return {
        "total": total,
        "resolved_percentage": resolved_percentage,
        "top_category": top_category
    }
def load_daily_complaints():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DATE(created_at), COUNT(*)
        FROM complaints
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at);
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows