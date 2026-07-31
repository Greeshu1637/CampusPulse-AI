"""
Main routes for CampusPulse AI
"""
from flask import Blueprint

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Root endpoint"""
    return "CampusPulse AI is Running"
