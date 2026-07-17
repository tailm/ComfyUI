"""
User Isolation Middleware

This middleware automatically extracts and validates user_id from requests,
injecting it into the request context for data isolation enforcement.
Unauthenticated requests (missing or empty user_id) are rejected with 401.
"""

import logging
from aiohttp import web
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

# Paths that do not require authentication
PUBLIC_PATHS = {"/login", "/api/login", "/api/logout", "/logout", "/user.css"}

# Static file extensions that are served without authentication
STATIC_EXTENSIONS = {".js", ".css", ".ico", ".png", ".jpg", ".svg", ".woff", ".woff2", ".ttf", ".map"}


class UserIsolationMiddleware:
    """
    Middleware for enforcing user data isolation.
    
    Extracts user_id from request headers/cookies and validates it,
    then injects user_id and is_admin flags into request context.
    Rejects unauthenticated requests with 401.
    """
    
    def __init__(self, user_manager):
        """
        Initialize the middleware.
        
        Args:
            user_manager: UserManager instance for user validation
        """
        self.user_manager = user_manager
    
    async def __call__(self, app, handler):
        """
        Middleware entry point.
        
        Args:
            app: aiohttp application
            handler: Next handler in the chain
            
        Returns:
            Middleware handler
        """
        async def middleware_handler(request):
            # Check if this is a public path that doesn't need auth
            path = request.path
            if path in PUBLIC_PATHS:
                return await handler(request)
            
            # Check if this is a static file request
            if any(path.endswith(ext) for ext in STATIC_EXTENSIONS):
                return await handler(request)
            
            # Check if this is the root page (frontend entry)
            if path == "/":
                return await handler(request)
            
            # Extract and validate user_id
            user_id, is_admin = self._extract_and_validate_user(request)
            
            if user_id is None:
                return web.json_response(
                    {"error": "Authentication required: user_id is missing or invalid"},
                    status=401
                )
            
            # Inject into request context
            request['user_id'] = user_id
            request['is_admin'] = is_admin
            
            # Continue to next handler
            return await handler(request)
        
        return middleware_handler
    
    def _extract_and_validate_user(self, request) -> Tuple[Optional[str], bool]:
        """
        Extract user_id from request and validate it.
        
        Args:
            request: aiohttp request
            
        Returns:
            Tuple of (user_id, is_admin). user_id is None if unauthenticated.
        """
        # Extract user_id
        user_id = self._extract_user_id(request)
        
        if not user_id:
            return None, False
        
        # Validate user_id
        is_valid, is_admin = self._validate_user_id(user_id)
        
        if not is_valid:
            logger.warning(f"Invalid user_id '{user_id}' in request")
            return None, False
        
        return user_id, is_admin
    
    def _extract_user_id(self, request) -> Optional[str]:
        """
        Extract user_id from request headers or cookies.
        
        Priority:
        1. Request header 'comfy-user'
        2. Request cookie 'comfy-user'
        
        Args:
            request: aiohttp request
            
        Returns:
            Extracted user_id string, or None if not found
        """
        # Try header first
        user_id = request.headers.get('comfy-user')
        if user_id:
            return user_id
        
        # Try cookie (use same name as header)
        user_id = request.cookies.get('comfy-user')
        if user_id:
            return user_id
        
        return None
    
    def _validate_user_id(self, user_id: str) -> Tuple[bool, bool]:
        """
        Validate user_id and check if it's an admin.
        
        Args:
            user_id: User ID to validate
            
        Returns:
            Tuple of (is_valid, is_admin)
        """
        # Check for system users (internal operations)
        if user_id.startswith('__system__'):
            return True, True
        
        # Check if user exists
        try:
            # Use user_manager to check if user exists
            if hasattr(self.user_manager, 'user_exists'):
                exists = self.user_manager.user_exists(user_id)
                if not exists:
                    return False, False
            else:
                # Check in user_manager.users dict
                if hasattr(self.user_manager, 'users'):
                    if user_id not in self.user_manager.users:
                        return False, False
            
            # Check if user is admin
            is_admin = self._is_admin(user_id)
            
            return True, is_admin
            
        except Exception as e:
            logger.error(f"Error validating user_id '{user_id}': {e}")
            return False, False
    
    def _is_admin(self, user_id: str) -> bool:
        """
        Check if user has admin privileges.
        
        Args:
            user_id: User ID to check
            
        Returns:
            True if user is admin, False otherwise
        """
        try:
            # Check if user_manager has is_admin method
            if hasattr(self.user_manager, 'is_admin'):
                return self.user_manager.is_admin(user_id)
            
            # Fallback: check if user is in admin list
            if hasattr(self.user_manager, 'get_admin_users'):
                admin_users = self.user_manager.get_admin_users()
                return user_id in admin_users
            
            # Default: no admin privileges
            return False
            
        except Exception as e:
            logger.error(f"Error checking admin status for user '{user_id}': {e}")
            return False


def setup_user_isolation_middleware(app, user_manager):
    """
    Setup user isolation middleware for the application.
    
    Args:
        app: aiohttp application
        user_manager: UserManager instance
    """
    middleware = UserIsolationMiddleware(user_manager)
    app.middlewares.append(middleware)
    logger.info("User isolation middleware installed")
