"""
CampusPulse AI - Main Application Entry Point
==============================================

This is the main Flask application entry point that:
- Creates the Flask app using the application factory pattern
- Configures the app with environment-specific settings
- Registers all blueprints (auth, dashboard, etc.)
- Sets up template and static folders to serve the frontend
- Runs the development server

Usage:
    python backend/app.py
    or
    flask run (with FLASK_APP=backend/app.py)
"""

import os
from flask import Flask, render_template, jsonify
from config import config


def create_app(config_name=None):
    """
    Application Factory Pattern
    
    Creates and configures the Flask application instance.
    This pattern allows us to create multiple app instances with
    different configurations (development, testing, production).
    
    Args:
        config_name (str): Configuration name ('development', 'production', 'testing')
                          If None, uses FLASK_ENV environment variable
    
    Returns:
        Flask: Configured Flask application instance
    """
    
    # Determine which configuration to use
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    # Create Flask app instance
    # Set template and static folders to point to frontend directory
    app = Flask(
        __name__,
        template_folder='../frontend/pages',  # Frontend HTML files
        static_folder='../frontend',          # Frontend CSS, JS, assets
        static_url_path=''                    # Serve static files from root URL
    )
    
    # Load configuration from config.py
    app.config.from_object(config[config_name])
    
    # Initialize app with configuration
    config[config_name].init_app(app)
    
    # ============================================================
    # REGISTER BLUEPRINTS
    # ============================================================
    # Blueprints are modular components that organize routes
    # Each blueprint handles a specific feature area
    
    # Import blueprints
    from routes.auth import auth_bp
    from routes.dashboard import dashboard_bp
    
    # Register authentication blueprint
    # All auth routes will be prefixed with /auth (e.g., /auth/login)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    # Register dashboard blueprint
    # All dashboard routes will be prefixed with /api (e.g., /api/dashboard)
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    
    # ============================================================
    # ROOT ROUTES
    # ============================================================
    
    @app.route('/')
    def index():
        """
        Home route - serves the main dashboard HTML page
        
        Returns:
            Rendered dashboard.html template
        """
        return render_template('dashboard.html')
    
    @app.route('/health')
    def health_check():
        """
        Health check endpoint for monitoring
        
        Returns:
            JSON response indicating server status
        """
        return jsonify({
            'status': 'healthy',
            'service': 'CampusPulse AI Backend',
            'version': '1.0.0',
            'environment': config_name
        }), 200
    
    @app.errorhandler(404)
    def not_found(error):
        """
        Custom 404 error handler
        
        Returns:
            JSON response for API calls, HTML for browser requests
        """
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """
        Custom 500 error handler
        
        Returns:
            JSON response with error details
        """
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred'
        }), 500
    
    # ============================================================
    # LOGGING SETUP (for production)
    # ============================================================
    if not app.debug and not app.testing:
        # TODO: Add file/stream logging for production
        # TODO: Add error tracking (e.g., Sentry)
        pass
    
    return app


# ============================================================
# APPLICATION ENTRY POINT
# ============================================================
if __name__ == '__main__':
    """
    Run the Flask development server
    
    This should only be used for development.
    For production, use a proper WSGI server like Gunicorn or uWSGI
    
    Example:
        gunicorn -w 4 -b 0.0.0.0:5000 backend.app:create_app()
    """
    
    # Create app instance
    app = create_app()
    
    # Get host and port from environment or use defaults
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Run the development server
    print(f"""
    ╔═══════════════════════════════════════════════════════╗
    ║         CampusPulse AI - Backend Server              ║
    ║                                                       ║
    ║  🚀 Server running at: http://{host}:{port}        ║
    ║  📊 Environment: {os.getenv('FLASK_ENV', 'development')}                      ║
    ║  🔧 Debug Mode: {debug}                              ║
    ║                                                       ║
    ║  API Endpoints:                                       ║
    ║    - Health: /health                                  ║
    ║    - Auth: /auth/*                                    ║
    ║    - API: /api/*                                      ║
    ╚═══════════════════════════════════════════════════════╝
    """)
    
    app.run(
        host=host,
        port=port,
        debug=debug
    )
