"""
CampusPulse AI - Flask Application Factory
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()


def create_app(config_name='development'):
    """
    Application factory pattern for Flask
    
    Args:
        config_name: Configuration environment (development/production)
    
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    # Configure login manager
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    
    # Register blueprints
    from app.blueprints.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    # Register error handlers
    register_error_handlers(app)
    
    return app


def register_error_handlers(app):
    """Register error handlers for common HTTP errors"""
    
    @app.errorhandler(404)
    def not_found(error):
        return {'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Resource not found'}}, 404
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'success': False, 'error': {'code': 'FORBIDDEN', 'message': 'Access denied'}}, 403
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'success': False, 'error': {'code': 'INTERNAL_ERROR', 'message': 'Internal server error'}}, 500


@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login"""
    from app.models.user import User
    return User.query.get(int(user_id))
