"""
Authentication Service
Business logic for Google OAuth 2.0 authentication
"""
import json
import requests
from flask import current_app, url_for, session
from oauthlib.oauth2 import WebApplicationClient
from app import db
from app.models.user import User


class AuthService:
    """
    Service class for handling Google OAuth 2.0 authentication flow
    """
    
    def __init__(self):
        self.client = None
    
    def _get_oauth_client(self):
        """Get or create OAuth client"""
        if not self.client:
            self.client = WebApplicationClient(current_app.config['GOOGLE_CLIENT_ID'])
        return self.client
    
    def _get_google_provider_cfg(self):
        """Get Google's OAuth 2.0 configuration"""
        discovery_url = current_app.config['GOOGLE_DISCOVERY_URL']
        return requests.get(discovery_url).json()
    
    def get_google_auth_url(self):
        """
        Generate Google OAuth authorization URL
        
        Returns:
            str: Authorization URL to redirect user to
        """
        client = self._get_oauth_client()
        google_provider_cfg = self._get_google_provider_cfg()
        authorization_endpoint = google_provider_cfg['authorization_endpoint']
        
        # Construct authorization request
        request_uri = client.prepare_request_uri(
            authorization_endpoint,
            redirect_uri=url_for('auth.callback', _external=True),
            scope=['openid', 'email', 'profile']
        )
        
        return request_uri
    
    def get_user_info_from_code(self, code):
        """
        Exchange authorization code for user information
        
        Args:
            code (str): Authorization code from Google
        
        Returns:
            dict: User information from Google
        """
        client = self._get_oauth_client()
        google_provider_cfg = self._get_google_provider_cfg()
        token_endpoint = google_provider_cfg['token_endpoint']
        
        # Exchange code for tokens
        token_url, headers, body = client.prepare_token_request(
            token_endpoint,
            authorization_response=url_for('auth.callback', _external=True) + f'?code={code}',
            redirect_url=url_for('auth.callback', _external=True),
            code=code
        )
        
        token_response = requests.post(
            token_url,
            headers=headers,
            data=body,
            auth=(current_app.config['GOOGLE_CLIENT_ID'], current_app.config['GOOGLE_CLIENT_SECRET'])
        )
        
        # Parse tokens
        client.parse_request_body_response(json.dumps(token_response.json()))
        
        # Get user info
        userinfo_endpoint = google_provider_cfg['userinfo_endpoint']
        uri, headers, body = client.add_token(userinfo_endpoint)
        userinfo_response = requests.get(uri, headers=headers, data=body)
        
        user_info = userinfo_response.json()
        
        # Verify email is verified
        if not user_info.get('email_verified'):
            raise ValueError('Email not verified by Google')
        
        return user_info
    
    def create_or_update_user(self, user_info):
        """
        Create new user or update existing user from Google user info
        
        Args:
            user_info (dict): User information from Google
        
        Returns:
            User: User model instance
        """
        google_id = user_info['sub']
        email = user_info['email']
        name = user_info.get('name', email.split('@')[0])
        picture = user_info.get('picture')
        
        # Check if user exists
        user = User.query.filter_by(google_id=google_id).first()
        
        if user:
            # Update existing user
            user.email = email
            user.name = name
            user.profile_picture_url = picture
            user.updated_at = db.func.now()
        else:
            # Create new user with default role (student)
            user = User(
                google_id=google_id,
                email=email,
                name=name,
                profile_picture_url=picture,
                role='student',  # Default role
                is_active=True
            )
            db.session.add(user)
        
        db.session.commit()
        return user
    
    def assign_role(self, user_id, role):
        """
        Assign role to user (admin function)
        
        Args:
            user_id (int): User ID
            role (str): Role to assign (student, admin, mess_manager, hostel_manager)
        
        Returns:
            User: Updated user
        """
        valid_roles = ['student', 'admin', 'mess_manager', 'hostel_manager']
        
        if role not in valid_roles:
            raise ValueError(f'Invalid role. Must be one of: {", ".join(valid_roles)}')
        
        user = User.query.get(user_id)
        if not user:
            raise ValueError('User not found')
        
        user.role = role
        db.session.commit()
        
        return user
