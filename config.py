"""
CampusPulse AI - Configuration Module
======================================

This module defines configuration classes for different environments:
- Development: For local development with debug enabled
- Testing: For running unit tests
- Production: For production deployment with security enabled

Each configuration class inherits from a base Config class that
contains common settings shared across all environments.

Usage:
    from config import config
    app.config.from_object(config['development'])
"""

import os
from datetime import timedelta


# ============================================================
# BASE CONFIGURATION CLASS
# ============================================================
class Config:
    """
    Base configuration class with settings common to all environments.
    
    Other configuration classes inherit from this and override
    specific settings as needed.
    """
    
    # ===== APPLICATION SETTINGS =====
    
    # Secret key for session management and CSRF protection
    # IMPORTANT: In production, this MUST be loaded from environment variable
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Application name
    APP_NAME = 'CampusPulse AI'
    
    # ===== DATABASE SETTINGS =====
    
    # SQLAlchemy database URI
    # Format: postgresql://username:password@hostname:port/database_name
    # Currently using placeholder - will be configured when database is set up
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///campuspulse.db'  # Fallback to SQLite for development
    
    # Disable modification tracking to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Echo SQL queries to console (useful for debugging)
    SQLALCHEMY_ECHO = False
    
    # ===== SESSION SETTINGS =====
    
    # Session configuration
    SESSION_COOKIE_NAME = 'campuspulse_session'
    SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access to cookies
    SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)  # Session timeout
    
    # ===== SECURITY SETTINGS =====
    
    # CSRF Protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None  # No time limit for CSRF tokens
    
    # ===== FILE UPLOAD SETTINGS =====
    
    # Maximum file size for uploads (16 MB)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    
    # Allowed file extensions for uploads
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    
    # Upload folder path
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    
    # ===== API SETTINGS =====
    
    # JSON response settings
    JSON_SORT_KEYS = False  # Don't sort JSON keys
    JSONIFY_PRETTYPRINT_REGULAR = True  # Pretty print JSON in development
    
    # ===== RATE LIMITING SETTINGS =====
    
    # Rate limiting (to be implemented with Flask-Limiter)
    RATELIMIT_ENABLED = True
    RATELIMIT_STORAGE_URL = 'memory://'  # Use Redis in production
    
    # ===== CORS SETTINGS =====
    
    # CORS (Cross-Origin Resource Sharing) settings
    # Adjust these based on your frontend domain
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5000']
    
    # ===== EMAIL SETTINGS (for future use) =====
    
    # Email configuration for notifications
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', '1', 'yes']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    
    # ===== REDIS SETTINGS (for future caching) =====
    
    # Redis configuration for caching and sessions
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    
    # ===== AI/ML SETTINGS =====
    
    # AI model configuration (for future ML features)
    AI_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml_models')
    AI_CONFIDENCE_THRESHOLD = 0.75
    
    @staticmethod
    def init_app(app):
        """
        Initialize application with this configuration.
        
        This method is called after the config is loaded.
        Use it to perform any configuration-specific initialization.
        
        Args:
            app: Flask application instance
        """
        pass


# ============================================================
# DEVELOPMENT CONFIGURATION
# ============================================================
class DevelopmentConfig(Config):
    """
    Development environment configuration.
    
    Enables debug mode, detailed error pages, and development tools.
    Uses SQLite database for easy setup.
    """
    
    # Enable debug mode for detailed error pages
    DEBUG = True
    
    # Enable testing mode
    TESTING = False
    
    # Echo SQL queries to console for debugging
    SQLALCHEMY_ECHO = True
    
    # Use SQLite for development (easy setup, no server needed)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'sqlite:///campuspulse_dev.db'
    
    # Pretty print JSON responses
    JSONIFY_PRETTYPRINT_REGULAR = True
    
    @staticmethod
    def init_app(app):
        """Initialize development-specific settings."""
        print('🔧 Development mode enabled')
        print('📊 Database: SQLite (development)')
        print('⚠️  Debug mode: ON')


# ============================================================
# TESTING CONFIGURATION
# ============================================================
class TestingConfig(Config):
    """
    Testing environment configuration.
    
    Used when running unit tests. Uses in-memory database
    and disables CSRF protection for easier testing.
    """
    
    # Enable testing mode
    TESTING = True
    
    # Disable CSRF for testing
    WTF_CSRF_ENABLED = False
    
    # Use in-memory SQLite database for tests
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Disable rate limiting during tests
    RATELIMIT_ENABLED = False
    
    @staticmethod
    def init_app(app):
        """Initialize testing-specific settings."""
        print('🧪 Testing mode enabled')


# ============================================================
# PRODUCTION CONFIGURATION
# ============================================================

        
        # TODO: Set up production logging
        # TODO: Set up error tracking (e.g., Sentry)
class ProductionConfig(Config):
    """
    Production environment configuration.

    Security-focused settings for deployment.
    """

    # Disable debug mode
    DEBUG = False
    TESTING = False

    # Production values from environment variables
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")

    # Production security settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Strict"

    # Disable JSON pretty printing
    JSONIFY_PRETTYPRINT_REGULAR = False

    # Redis
    RATELIMIT_STORAGE_URL = (
        os.environ.get("REDIS_URL")
        or "redis://localhost:6379/1"
    )

    @staticmethod
    def init_app(app):
        """Initialize production-specific settings."""
        print("🚀 Production mode enabled")
        print("🔒 Security: Enhanced")
        print("📊 Database: PostgreSQL")

# ============================================================
# CONFIGURATION DICTIONARY
# ============================================================
# Export configuration classes for easy import
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
