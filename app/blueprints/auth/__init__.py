"""
Authentication Blueprint
Handles Google OAuth 2.0 authentication and user session management
"""
from flask import Blueprint

auth_bp = Blueprint('auth', __name__)

from app.blueprints.auth import routes
