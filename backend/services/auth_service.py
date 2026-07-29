"""
CampusPulse AI - Authentication Service
========================================

This module provides authentication and authorization services:
- User authentication (login validation)
- Password verification
- Session management
- User creation (registration)
- Password reset

This service acts as a layer between routes and models,
containing business logic for authentication operations.

Current Status: MOCK IMPLEMENTATION
Uses hardcoded users for development. Will integrate with
database when User model is implemented.
"""

from models.user import User


class AuthService:
    """
    Authentication Service class.
    
    Provides methods for user authentication and authorization.
    Currently uses mock data for development.
    """
    
    def __init__(self):
        """
        Initialize AuthService.
        
        Sets up mock users for development.
        TODO: Replace with database queries when implemented.
        """
        # Mock users for development
        # In production, these will come from the database
        self.mock_users = {
            'student@campuspulse.edu': {
                'id': 1,
                'email': 'student@campuspulse.edu',
                'password': 'student123',  # TODO: Use hashed passwords
                'name': 'Rahul Sharma',
                'role': 'student',
                'department': 'Computer Science'
            },
            'admin@campuspulse.edu': {
                'id': 2,
                'email': 'admin@campuspulse.edu',
                'password': 'admin123',
                'name': 'Dr. A. Kumar',
                'role': 'admin',
                'department': 'Administration'
            },
            'maintenance@campuspulse.edu': {
                'id': 3,
                'email': 'maintenance@campuspulse.edu',
                'password': 'maintenance123',
                'name': 'Rajesh Singh',
                'role': 'maintenance',
                'department': 'Facilities'
            },
            'mess@campuspulse.edu': {
                'id': 4,
                'email': 'mess@campuspulse.edu',
                'password': 'mess123',
                'name': 'Suresh Patel',
                'role': 'mess',
                'department': 'Food Services'
            }
        }
    
    def authenticate_user(self, email, password, role=None):
        """
        Authenticate user with email and password.
        
        Args:
            email (str): User's email address
            password (str): User's password
            role (str, optional): Expected user role for validation
        
        Returns:
            dict: Authentication result with success status and user data
                  {
                      'success': bool,
                      'message': str,
                      'user': dict or None
                  }
        """
        try:
            # Validate input
            if not email or not password:
                return {
                    'success': False,
                    'message': 'Email and password are required',
                    'user': None
                }
            
            # TODO: Replace with database query
            # user = User.query.filter_by(email=email).first()
            
            # Mock authentication for development
            user_data = self.mock_users.get(email.lower())
            
            if not user_data:
                return {
                    'success': False,
                    'message': 'Invalid email or password',
                    'user': None
                }
            
            # Verify password
            # TODO: Use password hashing (check_password_hash)
            if user_data['password'] != password:
                return {
                    'success': False,
                    'message': 'Invalid email or password',
                    'user': None
                }
            
            # Verify role if specified
            if role and user_data['role'] != role:
                return {
                    'success': False,
                    'message': f'Access denied for role: {role}',
                    'user': None
                }
            
            # Create User object
            user = User(
                id=user_data['id'],
                email=user_data['email'],
                name=user_data['name'],
                role=user_data['role'],
                department=user_data.get('department')
            )
            
            # Authentication successful
            return {
                'success': True,
                'message': 'Login successful',
                'user': user.to_dict()
            }
        
        except Exception as e:
            print(f'Authentication error: {str(e)}')
            return {
                'success': False,
                'message': 'An error occurred during authentication',
                'user': None
            }
    
    def get_user_by_id(self, user_id):
        """
        Get user by ID.
        
        Args:
            user_id (int): User's ID
        
        Returns:
            User: User object or None
        """
        try:
            # TODO: Replace with database query
            # return User.query.get(user_id)
            
            # Mock implementation
            for user_data in self.mock_users.values():
                if user_data['id'] == user_id:
                    return User(
                        id=user_data['id'],
                        email=user_data['email'],
                        name=user_data['name'],
                        role=user_data['role'],
                        department=user_data.get('department')
                    )
            return None
        
        except Exception as e:
            print(f'Get user error: {str(e)}')
            return None
    
    def get_user_by_email(self, email):
        """
        Get user by email address.
        
        Args:
            email (str): User's email
        
        Returns:
            User: User object or None
        """
        try:
            # TODO: Replace with database query
            # return User.query.filter_by(email=email).first()
            
            # Mock implementation
            user_data = self.mock_users.get(email.lower())
            if user_data:
                return User(
                    id=user_data['id'],
                    email=user_data['email'],
                    name=user_data['name'],
                    role=user_data['role'],
                    department=user_data.get('department')
                )
            return None
        
        except Exception as e:
            print(f'Get user by email error: {str(e)}')
            return None
    
    def create_user(self, email, password, name, role, department=None):
        """
        Create new user account.
        
        Args:
            email (str): User's email
            password (str): User's password
            name (str): User's full name
            role (str): User's role
            department (str, optional): User's department
        
        Returns:
            dict: Result with success status and user data
        """
        try:
            # Validate input
            if not all([email, password, name, role]):
                return {
                    'success': False,
                    'message': 'All fields are required',
                    'user': None
                }
            
            # Check if user already exists
            # TODO: Replace with database query
            if email.lower() in self.mock_users:
                return {
                    'success': False,
                    'message': 'Email already registered',
                    'user': None
                }
            
            # TODO: Implement with database
            # Create new user
            # user = User(
            #     email=email,
            #     name=name,
            #     role=role,
            #     department=department
            # )
            # user.set_password(password)
            # db.session.add(user)
            # db.session.commit()
            
            # Mock implementation
            new_id = len(self.mock_users) + 1
            self.mock_users[email.lower()] = {
                'id': new_id,
                'email': email,
                'password': password,  # TODO: Hash password
                'name': name,
                'role': role,
                'department': department
            }
            
            user = User(
                id=new_id,
                email=email,
                name=name,
                role=role,
                department=department
            )
            
            return {
                'success': True,
                'message': 'User created successfully',
                'user': user.to_dict()
            }
        
        except Exception as e:
            print(f'Create user error: {str(e)}')
            return {
                'success': False,
                'message': 'Failed to create user',
                'user': None
            }
    
    def validate_password(self, password):
        """
        Validate password strength.
        
        Args:
            password (str): Password to validate
        
        Returns:
            dict: Validation result
                  {
                      'valid': bool,
                      'message': str
                  }
        """
        # Password requirements
        min_length = 8
        
        if len(password) < min_length:
            return {
                'valid': False,
                'message': f'Password must be at least {min_length} characters long'
            }
        
        # TODO: Add more validation rules
        # - At least one uppercase letter
        # - At least one lowercase letter
        # - At least one number
        # - At least one special character
        
        return {
            'valid': True,
            'message': 'Password is valid'
        }
    
    def generate_password_reset_token(self, email):
        """
        Generate password reset token.
        
        Args:
            email (str): User's email
        
        Returns:
            str: Reset token or None
        """
        # TODO: Implement password reset token generation
        # 1. Verify user exists
        # 2. Generate secure token
        # 3. Store token with expiration in database
        # 4. Return token for email
        pass
    
    def reset_password(self, token, new_password):
        """
        Reset password using token.
        
        Args:
            token (str): Password reset token
            new_password (str): New password
        
        Returns:
            dict: Reset result
        """
        # TODO: Implement password reset
        # 1. Validate token
        # 2. Check token expiration
        # 3. Validate new password
        # 4. Update user password
        # 5. Invalidate token
        pass


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def hash_password(password):
    """
    Hash password using bcrypt.
    
    Args:
        password (str): Plain text password
    
    Returns:
        str: Hashed password
    """
    # TODO: Implement with werkzeug.security
    # from werkzeug.security import generate_password_hash
    # return generate_password_hash(password)
    pass


def verify_password(password_hash, password):
    """
    Verify password against hash.
    
    Args:
        password_hash (str): Stored password hash
        password (str): Plain text password to verify
    
    Returns:
        bool: True if password matches, False otherwise
    """
    # TODO: Implement with werkzeug.security
    # from werkzeug.security import check_password_hash
    # return check_password_hash(password_hash, password)
    pass
