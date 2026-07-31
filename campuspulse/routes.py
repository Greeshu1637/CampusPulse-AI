"""
Main routes for CampusPulse AI
"""
from flask import Blueprint, render_template, redirect, url_for, session

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Root endpoint - redirect to login"""
    return redirect(url_for('main.login'))


@main_bp.route('/login')
def login():
    """Login page with role selection"""
    return render_template('login.html')


@main_bp.route('/select-role/<role>')
def select_role(role):
    """Temporarily store selected role and redirect to dashboard"""
    valid_roles = ['student', 'administrator', 'mess-manager', 'hostel-manager']
    
    if role not in valid_roles:
        return redirect(url_for('main.login'))
    
    # Store role in session (temporary, no authentication)
    session['role'] = role
    session['user_name'] = role.replace('-', ' ').title()
    session['user_id'] = 1  # Temporary user ID for testing
    
    return redirect(url_for('main.dashboard'))


@main_bp.route('/dashboard')
def dashboard():
    """Dashboard placeholder page"""
    role = session.get('role', 'student')
    user_name = session.get('user_name', 'User')
    
    return render_template('dashboard.html', role=role, user_name=user_name)
