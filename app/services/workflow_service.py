"""
Workflow Service

Provides user-isolated access to workflow management.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import Session

from app.database.workflow_models import Workflow
from app.database.isolation_repository import DataIsolationRepository, PermissionError
from app.assets.helpers import get_utc_now

logger = logging.getLogger(__name__)


class WorkflowService:
    """
    Service for managing workflows with user isolation.
    
    All methods enforce user_id filtering to ensure data isolation.
    """
    
    def __init__(
        self,
        session: Session,
        user_id: str,
        is_admin: bool = False
    ):
        """
        Initialize the workflow service.
        
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
            model_class=Workflow,
            user_id=user_id,
            is_admin=is_admin
        )
    
    def list_workflows(
        self,
        include_templates: bool = False,
        filters: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[Workflow]:
        """
        List workflows for the current user.
        
        Args:
            include_templates: Whether to include public templates
            filters: Additional filter conditions
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of workflows
        """
        # Build base query
        query = select(Workflow)
        
        if self.is_admin:
            # Admin can see all workflows
            pass
        else:
            # Regular user sees their own workflows
            conditions = [Workflow.user_id == self.user_id]
            
            # Optionally include public templates
            if include_templates:
                conditions.append(
                    and_(
                        Workflow.is_template == True,
                        Workflow.user_id != self.user_id
                    )
                )
            
            query = query.where(or_(*conditions))
        
        # Add additional filters
        if filters:
            for key, value in filters.items():
                if hasattr(Workflow, key):
                    query = query.where(getattr(Workflow, key) == value)
        
        # Order by updated_at descending
        query = query.order_by(desc(Workflow.updated_at))
        
        # Add pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        # Execute query
        result = self.session.execute(query)
        return list(result.scalars().all())
    
    def get_workflow(
        self,
        workflow_id: str,
        update_last_used: bool = True
    ) -> Workflow:
        """
        Get a workflow by ID with ownership validation.
        
        Args:
            workflow_id: Workflow ID
            update_last_used: Whether to update last_used_at timestamp
            
        Returns:
            Workflow instance
            
        Raises:
            PermissionError: If user doesn't own the workflow and it's not a template
            ValueError: If workflow not found
        """
        # Get workflow
        query = select(Workflow).where(Workflow.id == workflow_id)
        result = self.session.execute(query)
        workflow = result.scalar_one_or_none()
        
        if workflow is None:
            raise ValueError(f"Workflow not found: {workflow_id}")
        
        # Check access permission
        if not self.is_admin and workflow.user_id != self.user_id:
            # Allow access to public templates
            if not workflow.is_template:
                logger.warning(
                    f"User '{self.user_id}' attempted to access "
                    f"workflow owned by '{workflow.user_id}'"
                )
                raise PermissionError(
                    "You don't have permission to access this workflow"
                )
        
        # Update last_used_at timestamp
        if update_last_used:
            workflow.last_used_at = get_utc_now()
            self.session.commit()
            self.session.refresh(workflow)
        
        return workflow
    
    def save_workflow(
        self,
        name: str,
        workflow_json: Dict[str, Any],
        description: Optional[str] = None,
        is_template: bool = False,
        workflow_id: Optional[str] = None
    ) -> Workflow:
        """
        Save a workflow (create or update).
        
        Args:
            name: Workflow name
            workflow_json: Workflow JSON data
            description: Optional description
            is_template: Whether this is a template
            workflow_id: Optional existing workflow ID to update
            
        Returns:
            Saved workflow instance
        """
        if workflow_id:
            # Update existing workflow
            workflow = self.get_workflow(workflow_id, update_last_used=False)
            
            # Verify ownership (can't update others' workflows)
            if not self.is_admin and workflow.user_id != self.user_id:
                raise PermissionError(
                    "You don't have permission to update this workflow"
                )
            
            # Update fields
            workflow.name = name
            workflow.workflow_json = workflow_json
            workflow.description = description
            workflow.is_template = is_template
            workflow.updated_at = get_utc_now()
            
            self.session.commit()
            self.session.refresh(workflow)
            
            logger.info(f"Updated workflow {workflow_id}")
            return workflow
        else:
            # Create new workflow
            # Check for existing workflow with same name
            existing = self._find_by_name(name)
            
            if existing:
                # Update existing
                existing.workflow_json = workflow_json
                existing.description = description
                existing.is_template = is_template
                existing.updated_at = get_utc_now()
                
                self.session.commit()
                self.session.refresh(existing)
                
                logger.info(f"Updated existing workflow '{name}'")
                return existing
            else:
                # Create new
                workflow = self.repository.create_with_user({
                    'name': name,
                    'workflow_json': workflow_json,
                    'description': description,
                    'is_template': is_template,
                })
                
                logger.info(f"Created new workflow '{name}'")
                return workflow
    
    def delete_workflow(
        self,
        workflow_id: str
    ) -> bool:
        """
        Delete a workflow with ownership validation.
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            True if deleted
            
        Raises:
            PermissionError: If user doesn't own the workflow
        """
        return self.repository.delete_with_check(workflow_id)
    
    def _find_by_name(
        self,
        name: str
    ) -> Optional[Workflow]:
        """
        Find a workflow by name for the current user.
        
        Args:
            name: Workflow name
            
        Returns:
            Workflow instance or None
        """
        query = select(Workflow).where(
            and_(
                Workflow.user_id == self.user_id,
                Workflow.name == name
            )
        )
        
        result = self.session.execute(query)
        return result.scalar_one_or_none()
    
    def get_templates(
        self,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[Workflow]:
        """
        Get public workflow templates.
        
        Args:
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of template workflows
        """
        query = select(Workflow).where(
            Workflow.is_template == True
        ).order_by(desc(Workflow.updated_at))
        
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        result = self.session.execute(query)
        return list(result.scalars().all())
    
    def duplicate_workflow(
        self,
        workflow_id: str,
        new_name: Optional[str] = None
    ) -> Workflow:
        """
        Duplicate a workflow (create a copy for the current user).
        
        Args:
            workflow_id: Source workflow ID
            new_name: Optional new name (defaults to "Copy of {original_name}")
            
        Returns:
            Duplicated workflow instance
        """
        # Get source workflow (allows access to templates)
        source = self.get_workflow(workflow_id, update_last_used=False)
        
        # Determine new name
        if not new_name:
            new_name = f"Copy of {source.name}"
        
        # Create duplicate
        return self.save_workflow(
            name=new_name,
            workflow_json=source.workflow_json,
            description=source.description,
            is_template=False  # Duplicates are not templates by default
        )
    
    def count_workflows(
        self,
        include_templates: bool = False
    ) -> int:
        """
        Count workflows for the current user.
        
        Args:
            include_templates: Whether to include public templates
            
        Returns:
            Count of workflows
        """
        from sqlalchemy import func
        
        query = select(func.count()).select_from(Workflow)
        
        if self.is_admin:
            # Admin counts all
            pass
        else:
            conditions = [Workflow.user_id == self.user_id]
            
            if include_templates:
                conditions.append(
                    and_(
                        Workflow.is_template == True,
                        Workflow.user_id != self.user_id
                    )
                )
            
            query = query.where(or_(*conditions))
        
        result = self.session.execute(query)
        return result.scalar_one()
