"""
Prompt Service

Provides user-isolated access to prompt management.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, and_, desc
from sqlalchemy.orm import Session

from app.database.workflow_models import Prompt
from app.database.isolation_repository import DataIsolationRepository, PermissionError
from app.assets.helpers import get_utc_now

logger = logging.getLogger(__name__)


class PromptService:
    """
    Service for managing prompts with user isolation.
    
    All methods enforce user_id filtering to ensure data isolation.
    """
    
    def __init__(
        self,
        session: Session,
        user_id: str,
        is_admin: bool = False
    ):
        """
        Initialize the prompt service.
        
        Args:
            session: SQLAlchemy session
            user_id: Current user's ID
            is_admin: Whether the user has admin privileges
        """
        self.session = session
        self.user_id = user_id
        self.is_admin = is_admin
        self.repository = DataIsolationRepository(
            session=session,
            model_class=Prompt,
            user_id=user_id,
            is_admin=is_admin
        )
    
    def save_prompt(
        self,
        prompt_json: Dict[str, Any],
        workflow_id: Optional[str] = None,
        prompt_id: Optional[str] = None
    ) -> Prompt:
        """
        Save a prompt (create or update).
        
        Args:
            prompt_json: Prompt JSON data
            workflow_id: Optional workflow ID to associate
            prompt_id: Optional existing prompt ID to update
            
        Returns:
            Saved prompt instance
        """
        if prompt_id:
            # Update existing prompt
            prompt = self.get_prompt(prompt_id)
            
            # Update fields
            prompt.prompt_json = prompt_json
            if workflow_id is not None:
                prompt.workflow_id = workflow_id
            
            self.session.commit()
            self.session.refresh(prompt)
            
            logger.info(f"Updated prompt {prompt_id}")
            return prompt
        else:
            # Create new prompt
            prompt = self.repository.create_with_user({
                'prompt_json': prompt_json,
                'workflow_id': workflow_id,
            })
            
            logger.info(f"Created new prompt {prompt.id}")
            return prompt
    
    def get_prompt(
        self,
        prompt_id: str
    ) -> Prompt:
        """
        Get a prompt by ID with ownership validation.
        
        Args:
            prompt_id: Prompt ID
            
        Returns:
            Prompt instance
            
        Raises:
            PermissionError: If user doesn't own the prompt
            ValueError: If prompt not found
        """
        return self.repository.get_by_id_with_check(prompt_id)
    
    def list_prompts(
        self,
        workflow_id: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[Prompt]:
        """
        List prompts for the current user.
        
        Args:
            workflow_id: Optional workflow ID to filter by
            filters: Additional filter conditions
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of prompts
        """
        # Build filters
        query_filters = filters or {}
        
        if workflow_id:
            query_filters['workflow_id'] = workflow_id
        
        # Build order criteria
        order_criteria = [desc(Prompt.created_at)]
        
        # Query with user filter
        return self.repository.query_with_user_filter(
            filters=query_filters,
            order_by=order_criteria,
            limit=limit,
            offset=offset
        )
    
    def increment_execution_count(
        self,
        prompt_id: str
    ) -> Prompt:
        """
        Increment the execution count for a prompt.
        
        Args:
            prompt_id: Prompt ID
            
        Returns:
            Updated prompt instance
        """
        prompt = self.get_prompt(prompt_id)
        
        # Increment count and update timestamp
        prompt.execution_count += 1
        prompt.last_execution_at = get_utc_now()
        
        self.session.commit()
        self.session.refresh(prompt)
        
        logger.debug(f"Incremented execution count for prompt {prompt_id}")
        return prompt
    
    def delete_prompt(
        self,
        prompt_id: str
    ) -> bool:
        """
        Delete a prompt with ownership validation.
        
        Args:
            prompt_id: Prompt ID
            
        Returns:
            True if deleted
            
        Raises:
            PermissionError: If user doesn't own the prompt
        """
        return self.repository.delete_with_check(prompt_id)
    
    def count_prompts(
        self,
        workflow_id: Optional[str] = None
    ) -> int:
        """
        Count prompts for the current user.
        
        Args:
            workflow_id: Optional workflow ID to filter by
            
        Returns:
            Count of prompts
        """
        filters = {}
        if workflow_id:
            filters['workflow_id'] = workflow_id
        
        return self.repository.count_with_user_filter(filters)
    
    def get_prompt_statistics(self) -> Dict[str, Any]:
        """
        Get statistics for the current user's prompts.
        
        Returns:
            Dictionary with statistics
        """
        # Get all prompts for the user
        prompts = self.list_prompts()
        
        # Calculate statistics
        total_prompts = len(prompts)
        total_executions = sum(p.execution_count for p in prompts)
        
        # Count by workflow
        workflow_counts = {}
        for prompt in prompts:
            wf_id = prompt.workflow_id or 'none'
            workflow_counts[wf_id] = workflow_counts.get(wf_id, 0) + 1
        
        return {
            'total_prompts': total_prompts,
            'total_executions': total_executions,
            'by_workflow': workflow_counts,
            'average_executions': (
                total_executions / total_prompts if total_prompts > 0 else 0
            )
        }
    
    def get_recently_executed(
        self,
        limit: int = 10
    ) -> List[Prompt]:
        """
        Get recently executed prompts.
        
        Args:
            limit: Maximum number of results
            
        Returns:
            List of prompts ordered by last_execution_at
        """
        # Build query
        query = select(Prompt).where(
            Prompt.last_execution_at.isnot(None)
        )
        
        # Add user filter if not admin
        if not self.is_admin:
            query = query.where(Prompt.user_id == self.user_id)
        
        # Order by last execution time
        query = query.order_by(desc(Prompt.last_execution_at))
        query = query.limit(limit)
        
        # Execute query
        result = self.session.execute(query)
        return list(result.scalars().all())
    
    def get_most_executed(
        self,
        limit: int = 10
    ) -> List[Prompt]:
        """
        Get most executed prompts.
        
        Args:
            limit: Maximum number of results
            
        Returns:
            List of prompts ordered by execution_count
        """
        # Build query
        query = select(Prompt)
        
        # Add user filter if not admin
        if not self.is_admin:
            query = query.where(Prompt.user_id == self.user_id)
        
        # Order by execution count
        query = query.order_by(desc(Prompt.execution_count))
        query = query.limit(limit)
        
        # Execute query
        result = self.session.execute(query)
        return list(result.scalars().all())
