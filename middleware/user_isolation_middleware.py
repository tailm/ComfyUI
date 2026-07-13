"""
User Isolation Middleware

This middleware automatically extracts and validates user_id from requests,
injecting it into the request context for data isolation enforcement.
"""

import logging
from aiohttp import web
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


class UserIsolationMiddleware:
    """
    Middleware for enforcing user data isolation.
    
    Extracts user_id from request headers/cookies and validates it,
    then injects user_id and is_admin flags into request context.
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
            # Extract and validate user_id
            user_id, is_admin = self._extract_and_validate_user(request)
            
            # Inject into request context
            request['user_id'] = user_id
            request['is_admin'] = is_admin
            
            # Continue to next handler
            return await handler(request)
        
        return middleware_handler
    
    def _extract_and_validate_user(self, request) -> Tuple[str, bool]:
        """
        Extract user_id from request and validate it.
        
        Args:
            request: aiohttp request
            
        Returns:
            Tuple of (user_id, is_admin)
        """
        # Extract user_id
        user_id = self._extract_user_id(request)
        
        # Validate user_id
        is_valid, is_admin = self._validate_user_id(user_id)
        
        if not is_valid:
            # Fall back to default user
            logger.warning(f"Invalid user_id '{user_id}', falling back to default")
            user_id = "0"
            is_admin = False
        
        return user_id, is_admin
    
    def _extract_user_id(self, request) -> str:
        """
        Extract user_id from request headers, cookies, or use default.
        
        Priority:
        1. Request header 'comfy-user'
        2. Request cookie 'comfy_user'
        3. Default value '0'
        
        Args:
            request: aiohttp request
            
        Returns:
            Extracted user_id string
        """
        # Try header first
        user_id = request.headers.get('comfy-user')
        if user_id:
            return user_id
        
        # Try cookie
        user_id = request.cookies.get('comfy_user')
        if user_id:
            return user_id
        
        # Use default
        return "0"
    
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
                # If user_manager doesn't have user_exists, assume valid
                # This handles cases where multi-user mode is disabled
                pass
            
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
