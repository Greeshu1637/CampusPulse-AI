"""
Smart Dining Blueprint
"""
from flask import Blueprint

dining_bp = Blueprint('dining', __name__, url_prefix='/dining')

from campuspulse.blueprints.dining import routes
