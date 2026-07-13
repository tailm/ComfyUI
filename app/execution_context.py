"""
Execution context for user data isolation.

Provides thread-local storage for user_id during node execution.
This ensures all file operations are automatically routed to user-specific directories.
"""

import threading
from typing import Optional

# Thread-local storage for execution context
_context = threading.local()


def set_execution_user(user_id: str) -> None:
    """
    Set the current execution user ID.

    This should be called at the start of prompt execution
    to ensure all subsequent file operations use the correct user directory.

    Args:
        user_id: The user ID for this execution
    """
    _context.user_id = user_id


def get_execution_user() -> Optional[str]:
    """
    Get the current execution user ID.

    Returns:
        The current user ID, or None if not set
    """
    return getattr(_context, 'user_id', None)


def clear_execution_user() -> None:
    """
    Clear the current execution user ID.

    This should be called after prompt execution completes
    to clean up the execution context.
    """
    if hasattr(_context, 'user_id'):
        delattr(_context, 'user_id')


class ExecutionContext:
    """
    Context manager for execution user.

    Usage:
        with ExecutionContext(user_id):
            # All file operations in this block
            # will use user-specific directories
            ...
    """

    def __init__(self, user_id: str):
        self.user_id = user_id

    def __enter__(self):
        set_execution_user(self.user_id)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        clear_execution_user()
        return False
