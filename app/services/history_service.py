"""
History Service

Provides user-isolated access to execution history records.
"""

import json
import logging
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional

import folder_paths

logger = logging.getLogger(__name__)


class HistoryService:
    """
    Service for managing execution history with user isolation.
    
    All methods enforce user_id filtering to ensure data isolation.
    """
    
    def __init__(self, user_id: str, is_admin: bool = False):
        """
        Initialize the history service.
        
        Args:
            user_id: Current user's ID
            is_admin: Whether the user has admin privileges
        """
        self.user_id = user_id
        self.is_admin = is_admin
        self.db_path = self._get_db_path()
    
    def _get_db_path(self) -> str:
        """Get the database path."""
        import os
        return os.path.join(folder_paths.get_user_directory(), "comfyui.db")
    
    def _connect(self) -> sqlite3.Connection:
        """Connect to the database."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def get_history(
        self,
        max_items: Optional[int] = None,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get execution history for the current user.
        
        Args:
            max_items: Maximum number of items to return
            offset: Offset for pagination
            
        Returns:
            Dictionary of history records keyed by prompt_id
        """
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # Admin can see all history
            if self.is_admin:
                if max_items:
                    cursor.execute('''
                        SELECT prompt_id, prompt, outputs, status, created_at 
                        FROM history 
                        ORDER BY created_at DESC 
                        LIMIT ? OFFSET ?
                    ''', (max_items, offset))
                else:
                    cursor.execute('''
                        SELECT prompt_id, prompt, outputs, status, created_at 
                        FROM history 
                        ORDER BY created_at DESC
                    ''')
            else:
                # Regular user only sees their own history
                if max_items:
                    cursor.execute('''
                        SELECT prompt_id, prompt, outputs, status, created_at 
                        FROM history 
                        WHERE user_id = ? 
                        ORDER BY created_at DESC 
                        LIMIT ? OFFSET ?
                    ''', (self.user_id, max_items, offset))
                else:
                    cursor.execute('''
                        SELECT prompt_id, prompt, outputs, status, created_at 
                        FROM history 
                        WHERE user_id = ? 
                        ORDER BY created_at DESC
                    ''', (self.user_id,))
            
            # Build history dictionary
            history = {}
            for row in cursor.fetchall():
                prompt_id = row['prompt_id']
                history[prompt_id] = {
                    'prompt': json.loads(row['prompt']) if row['prompt'] else None,
                    'outputs': json.loads(row['outputs']) if row['outputs'] else {},
                    'status': json.loads(row['status']) if row['status'] else None,
                    'created_at': row['created_at']
                }
            
            return history
            
        finally:
            conn.close()
    
    def get_history_by_prompt_id(
        self,
        prompt_id: str
    ) -> Dict[str, Any]:
        """
        Get a specific history record by prompt_id.
        
        Args:
            prompt_id: Prompt ID to retrieve
            
        Returns:
            History record
            
        Raises:
            PermissionError: If user doesn't own the record
            ValueError: If record not found
        """
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # Get the record
            cursor.execute('''
                SELECT prompt_id, user_id, prompt, outputs, status, created_at 
                FROM history 
                WHERE prompt_id = ?
            ''', (prompt_id,))
            
            row = cursor.fetchone()
            
            if row is None:
                raise ValueError(f"History record not found: {prompt_id}")
            
            # Check ownership (skip for admins)
            if not self.is_admin and row['user_id'] != self.user_id:
                logger.warning(
                    f"User '{self.user_id}' attempted to access "
                    f"history owned by '{row['user_id']}'"
                )
                raise PermissionError(
                    "You don't have permission to access this history record"
                )
            
            # Return the record
            return {
                'prompt': json.loads(row['prompt']) if row['prompt'] else None,
                'outputs': json.loads(row['outputs']) if row['outputs'] else {},
                'status': json.loads(row['status']) if row['status'] else None,
                'created_at': row['created_at']
            }
            
        finally:
            conn.close()
    
    def delete_history(
        self,
        prompt_id: str
    ) -> bool:
        """
        Delete a history record.
        
        Args:
            prompt_id: Prompt ID to delete
            
        Returns:
            True if deleted
            
        Raises:
            PermissionError: If user doesn't own the record
        """
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # First verify ownership
            cursor.execute('''
                SELECT user_id FROM history WHERE prompt_id = ?
            ''', (prompt_id,))
            
            row = cursor.fetchone()
            
            if row is None:
                raise ValueError(f"History record not found: {prompt_id}")
            
            # Check ownership (skip for admins)
            if not self.is_admin and row['user_id'] != self.user_id:
                logger.warning(
                    f"User '{self.user_id}' attempted to delete "
                    f"history owned by '{row['user_id']}'"
                )
                raise PermissionError(
                    "You don't have permission to delete this history record"
                )
            
            # Delete the record
            cursor.execute('''
                DELETE FROM history WHERE prompt_id = ?
            ''', (prompt_id,))
            
            conn.commit()
            
            logger.info(f"Deleted history record {prompt_id}")
            return True
            
        finally:
            conn.close()
    
    def get_user_statistics(self) -> Dict[str, Any]:
        """
        Get statistics for the current user.
        
        Returns:
            Dictionary with statistics
        """
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            # Count total executions
            if self.is_admin:
                cursor.execute('SELECT COUNT(*) as count FROM history')
            else:
                cursor.execute(
                    'SELECT COUNT(*) as count FROM history WHERE user_id = ?',
                    (self.user_id,)
                )
            total = cursor.fetchone()['count']
            
            # Count successful executions
            if self.is_admin:
                cursor.execute('''
                    SELECT COUNT(*) as count 
                    FROM history 
                    WHERE status LIKE '%"status_str": "success"%'
                ''')
            else:
                cursor.execute('''
                    SELECT COUNT(*) as count 
                    FROM history 
                    WHERE user_id = ? AND status LIKE '%"status_str": "success"%'
                ''', (self.user_id,))
            successful = cursor.fetchone()['count']
            
            # Count failed executions
            if self.is_admin:
                cursor.execute('''
                    SELECT COUNT(*) as count 
                    FROM history 
                    WHERE status LIKE '%"status_str": "error"%'
                ''')
            else:
                cursor.execute('''
                    SELECT COUNT(*) as count 
                    FROM history 
                    WHERE user_id = ? AND status LIKE '%"status_str": "error"%'
                ''', (self.user_id,))
            failed = cursor.fetchone()['count']
            
            # Calculate rates
            success_rate = (successful / total * 100) if total > 0 else 0
            failure_rate = (failed / total * 100) if total > 0 else 0
            
            return {
                'total_executions': total,
                'successful': successful,
                'failed': failed,
                'success_rate': round(success_rate, 2),
                'failure_rate': round(failure_rate, 2)
            }
            
        finally:
            conn.close()
    
    def clear_user_history(self) -> int:
        """
        Clear all history for the current user.
        
        Returns:
            Number of records deleted
        """
        conn = self._connect()
        cursor = conn.cursor()
        
        try:
            if self.is_admin:
                # Admin clears all history
                cursor.execute('SELECT COUNT(*) as count FROM history')
                count = cursor.fetchone()['count']
                cursor.execute('DELETE FROM history')
            else:
                # User clears only their own history
                cursor.execute(
                    'SELECT COUNT(*) as count FROM history WHERE user_id = ?',
                    (self.user_id,)
                )
                count = cursor.fetchone()['count']
                cursor.execute(
                    'DELETE FROM history WHERE user_id = ?',
                    (self.user_id,)
                )
            
            conn.commit()
            
            logger.info(f"Cleared {count} history records for user {self.user_id}")
            return count
            
        finally:
            conn.close()
