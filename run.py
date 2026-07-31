"""
CampusPulse AI - Application Entry Point
"""
import os
from campuspulse import create_app, db

# Get configuration from environment variable or default to development
config_name = os.environ.get('FLASK_ENV', 'development')

# Create Flask application
app = create_app(config_name)


@app.shell_context_processor
def make_shell_context():
    """Make database available in Flask shell"""
    return {'db': db}


@app.cli.command()
def init_db():
    """Initialize database tables"""
    db.create_all()
    print('Database tables created successfully!')


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=(config_name == 'development')
    )
