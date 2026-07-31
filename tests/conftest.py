"""
Pytest Configuration
Fixtures and configuration for testing
"""
import pytest
from app import create_app, db
from app.models.user import User


@pytest.fixture(scope='session')
def app():
    """Create application for testing"""
    app = create_app('development')
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost:5432/campuspulse_ai_test'
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture(scope='function')
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture(scope='function')
def session(app):
    """Create database session for testing"""
    with app.app_context():
        connection = db.engine.connect()
        transaction = connection.begin()
        
        session = db.session
        yield session
        
        transaction.rollback()
        connection.close()


@pytest.fixture
def sample_user(session):
    """Create a sample user for testing"""
    user = User(
        google_id='test_google_id_123',
        email='test@example.com',
        name='Test User',
        role='student',
        is_active=True
    )
    session.add(user)
    session.commit()
    return user
