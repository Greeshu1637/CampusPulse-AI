"""
CampusPulse AI - Sprint 2
Simple Flask app with login page and dashboard
No authentication logic yet
"""
from flask import Flask, render_template, redirect, url_for, session

app = Flask(__name__)
app.secret_key = 'dev-secret-key-sprint-2'


@app.route('/')
def index():
    """Landing page - redirect to login"""
    return redirect(url_for('login'))


@app.route('/login')
def login():
    """Login page with role selection cards"""
    return render_template('login.html')


@app.route('/select-role/<role>')
def select_role(role):
    """Temporarily store selected role and redirect to dashboard"""
    valid_roles = ['student', 'administrator', 'mess-manager', 'hostel-manager']
    
    if role not in valid_roles:
        return redirect(url_for('login'))
    
    # Store role in session (temporary, no auth)
    session['role'] = role
    session['user_name'] = f'{role.replace("-", " ").title()} User'
    
    return redirect(url_for('dashboard'))


@app.route('/dashboard')
def dashboard():
    """Dashboard with sidebar and module cards"""
    # Get role from session or default to student
    role = session.get('role', 'student')
    user_name = session.get('user_name', 'User')
    
    return render_template('dashboard.html', role=role, user_name=user_name)


@app.route('/logout')
def logout():
    """Clear session and redirect to login"""
    session.clear()
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
