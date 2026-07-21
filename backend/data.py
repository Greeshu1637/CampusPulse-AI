from analytics import load_dashboard_data, load_complaint_statistics

dashboard_data = load_dashboard_data()

complaint_stats = load_complaint_statistics()

dashboard_data["pending_complaints"] = complaint_stats["Pending"]
dashboard_data["resolved_complaints"] = complaint_stats["Resolved"]