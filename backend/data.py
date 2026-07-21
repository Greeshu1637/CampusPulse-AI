from analytics import (
    load_dashboard_data,
    load_complaint_statistics,
    load_category_statistics,
    load_dashboard_summary
)

# Load dashboard data
dashboard_data = load_dashboard_data()

# Load complaint statistics
complaint_stats = load_complaint_statistics()

dashboard_data["pending_complaints"] = complaint_stats["Pending"]
dashboard_data["resolved_complaints"] = complaint_stats["Resolved"]

# Load category statistics
category_stats = load_category_statistics()

dashboard_data["category_labels"] = [row[0] for row in category_stats]
dashboard_data["category_values"] = [row[1] for row in category_stats]

# Load dashboard summary
summary = load_dashboard_summary()

dashboard_data["total_db_complaints"] = summary["total"]
dashboard_data["resolved_percentage"] = summary["resolved_percentage"]
dashboard_data["top_category"] = summary["top_category"]