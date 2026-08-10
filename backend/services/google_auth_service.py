"""
CampusPulse AI - Google OAuth 2.0 Service
==========================================

This service handles Google OAuth 2.0 authentication logic:
- Generate authorization URLs
- Exchange authorization codes for tokens
- Fetch user profile from Google
- Create or update users in database

Uses google-auth and google-auth-oauthlib libraries.

Configuration (from .env):
- GOOGLE_CLIENT_ID: Google OAuth client ID
- GOOGLE_CLIENT_SECRET: Google OAuth client secret
"""

import os
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google_auth_oauthlib.flow import Flow
from backend.models.user import User, get_user_by_email, get_user_by_google_id, create_google_user
from backend.database import db
from datetime import datetime


class GoogleAuthService:
    """
    Google OAuth 2.0 authentication service.
    
    Handles the complete OAuth flow and user management.
    """
    
    def __init__(self):
        """
        Initialize Google Auth Service.
        
        Loads configuration from environment variables.
        """
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        
        # Google OAuth 2.0 endpoints
        self.authorization_base_url = 'https://accounts.google.com/o/oauth2/v2/auth'
        self.token_url = 'https://oauth2.googleapis.com/token'
        self.userinfo_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        
        # OAuth scopes
        self.scopes = [
            'openid',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ]
        
        # Validate configuration
        if not self.client_id or not self.client_secret:
            print('⚠️  Warning: Google OAuth credentials not configured')
            print('   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env')
    
    def get_authorization_url(self, redirect_uri, state=None):
        """
        Generate Google OAuth authorization URL.
        
        Args:
            redirect_uri (str): Callback URL after authorization
            state (str, optional): CSRF protection token
        
        Returns:
            str: Authorization URL to redirect user to
        """
        try:
            if not self.client_id or not self.client_secret:
                print('Error: Google OAuth not configured')
                return None
            
            # Create Flow instance
            flow = Flow.from_client_config(
                {
                    'web': {
                        'client_id': self.client_id,
                        'client_secret': self.client_secret,
                        'auth_uri': self.authorization_base_url,
                        'token_uri': self.token_url,
                        'redirect_uris': [redirect_uri]
                    }
                },
                scopes=self.scopes,
                redirect_uri=redirect_uri
            )
            
            # Generate authorization URL
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                prompt='select_account'  # Force account selection
            )
            
            return authorization_url
        
        except Exception as e:
            print(f'Error generating authorization URL: {str(e)}')
            return None
    
    def exchange_code_for_token(self, code, redirect_uri):
        """
        Exchange authorization code for access token.
        
        Args:
            code (str): Authorization code from Google
            redirect_uri (str): Callback URL (must match the one used in authorization)
        
        Returns:
            dict: Token response from Google or None
        """
        try:
            # Create Flow instance
            flow = Flow.from_client_config(
                {
                    'web': {
                        'client_id': self.client_id,
                        'client_secret': self.client_secret,
                        'auth_uri': self.authorization_base_url,
                        'token_uri': self.token_url,
                        'redirect_uris': [redirect_uri]
                    }
                },
                scopes=self.scopes,
                redirect_uri=redirect_uri
            )
            
            # Exchange code for token
            flow.fetch_token(code=code)
            
            # Get credentials
            credentials = flow.credentials
            
            return {
                'access_token': credentials.token,
                'id_token': credentials.id_token,
                'refresh_token': credentials.refresh_token
            }
        
        except Exception as e:
            print(f'Error exchanging code for token: {str(e)}')
            return None
    
    def get_user_info(self, access_token):
        """
        Fetch user profile from Google.
        
        Args:
            access_token (str): Google OAuth access token
        
        Returns:
            dict: User profile data or None
                  {
                      'id': Google user ID,
                      'email': User email,
                      'name': Full name,
                      'picture': Profile picture URL,
                      'verified_email': Email verification status
                  }
        """
        try:
            # Make request to Google userinfo endpoint
            headers = {'Authorization': f'Bearer {access_token}'}
            response = requests.get(self.userinfo_url, headers=headers)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f'Error fetching user info: {response.status_code}')
                return None
        
        except Exception as e:
            print(f'Error getting user info: {str(e)}')
            return None
    
    def handle_callback(self, code, redirect_uri):
        """
        Handle complete OAuth callback flow.
        
        This method:
        1. Exchanges code for token
        2. Fetches user profile
        3. Creates or updates user in database
        4. Updates last login
        
        Args:
            code (str): Authorization code from Google
            redirect_uri (str): Callback URL
        
        Returns:
            dict: Result with success status and user object
                  {
                      'success': bool,
                      'message': str,
                      'user': User object or None
                  }
        """
        try:
            # Step 1: Exchange code for token
            token_data = self.exchange_code_for_token(code, redirect_uri)
            if not token_data:
                return {
                    'success': False,
                    'message': 'Failed to exchange code for token',
                    'user': None
                }
            
            # Step 2: Fetch user profile
            user_info = self.get_user_info(token_data['access_token'])
            if not user_info:
                return {
                    'success': False,
                    'message': 'Failed to fetch user profile',
                    'user': None
                }
            
            # Extract user data
            google_id = user_info.get('id')
            email = user_info.get('email')
            name = user_info.get('name')
            picture = user_info.get('picture')
            
            if not google_id or not email:
                return {
                    'success': False,
                    'message': 'Incomplete user data from Google',
                    'user': None
                }
            
            # Step 3: Find or create user
            user = self.find_or_create_user(google_id, email, name, picture)
            if not user:
                return {
                    'success': False,
                    'message': 'Failed to create or find user',
                    'user': None
                }
            
            # Step 4: Update last login
            user.update_last_login()
            
            return {
                'success': True,
                'message': 'Authentication successful',
                'user': user
            }
        
        except Exception as e:
            print(f'Error handling callback: {str(e)}')
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'message': f'Exception during authentication: {str(e)}',
                'user': None
            }
    
    def find_or_create_user(self, google_id, email, name, picture):
        """
        Find existing user or create new one.
        
        Search priority:
        1. Search by Google ID
        2. Search by email (for existing email users)
        3. Create new user
        
        Args:
            google_id (str): Google OAuth ID
            email (str): User email
            name (str): User name
            picture (str): Profile picture URL
        
        Returns:
            User: User object or None
        """
        try:
            # Try to find by Google ID
            user = get_user_by_google_id(google_id)
            if user:
                # Update user info if changed
                if user.name != name:
                    user.name = name
                if user.profile_picture != picture:
                    user.profile_picture = picture
                if not user.is_verified:
                    user.is_verified = True
                db.session.commit()
                
                print(f'✓ Existing Google user found: {email}')
                return user
            
            # Try to find by email (existing email user)
            user = get_user_by_email(email)
            if user:
                # Link Google account to existing user
                user.google_id = google_id
                user.profile_picture = picture
                user.is_verified = True
                db.session.commit()
                
                print(f'✓ Linked Google account to existing user: {email}')
                return user
            
            # Create new user
            user = create_google_user(
                google_id=google_id,
                email=email,
                name=name,
                picture=picture,
                role='student'  # Default role
            )
            
            print(f'✓ New Google user created: {email}')
            return user
        
        except Exception as e:
            print(f'Error finding/creating user: {str(e)}')
            db.session.rollback()
            return None
