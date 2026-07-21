import pandas as pd

complaints_df = pd.read_csv("backend/data_files/complaints.csv")

def load_dashboard_data():

    df = pd.read_csv("backend/data_files/dashboard.csv")

    dashboard_data = {
        "students": int(df.loc[df["Metric"] == "Students", "Value"].values[0]),
        "complaints": int(df.loc[df["Metric"] == "Complaints", "Value"].values[0]),
        "mess": df.loc[df["Metric"] == "Mess Satisfaction", "Value"].values[0],
        "rooms": int(df.loc[df["Metric"] == "Empty Rooms", "Value"].values[0])
    }

    # -------- KPIs --------

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