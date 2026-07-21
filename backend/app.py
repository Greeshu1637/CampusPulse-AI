from flask import Flask, render_template
from data import dashboard_data
app = Flask(__name__)
@app.route("/")
def home():
    return render_template(
        "index.html",
        data=dashboard_data
    )

if __name__ == "__main__":
    app.run(debug=True)