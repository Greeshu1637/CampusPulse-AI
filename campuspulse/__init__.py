"""
CampusPulse AI - Application Factory
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_name='development'):
    """
    Application factory pattern
    
    Args:
        config_name: Configuration environment (development/production)
    
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    from campuspulse.config import config
    app.config.from_object(config[config_name])
    
    # Set secret key for sessions
    app.secret_key = app.config['SECRET_KEY']
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Register routes
    from campuspulse.routes import main_bp
    app.register_blueprint(main_bp)
    
    # Register Smart Dining blueprint
    from campuspulse.blueprints.dining import dining_bp
    app.register_blueprint(dining_bp)
    
    return app
