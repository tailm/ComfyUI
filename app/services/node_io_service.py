"""
NodeIO Service

Provides user-isolated access to node input/output tracking.
"""

import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select, and_, desc
from sqlalchemy.orm import Session

from app.database.workflow_models import NodeIO
from app.database.isolation_repository import DataIsolationRepository, PermissionError
from app.assets.helpers import get_utc_now

logger = logging.getLogger(__name__)


class NodeIOService:
    """
    Service for managing node input/output records with user isolation.
    
    All methods enforce user_id filtering to ensure data isolation.
    """
    
    def __init__(
        self,
        session: Session,
        user_id: str,
        is_admin: bool = False
    ):
        """
        Initialize the NodeIO service.
        
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
            model_class=NodeIO,
            user_id=user_id,
            is_admin=is_admin
        )
    
    def save_node_io(
        self,
        prompt_id: str,
        node_id: str,
        input_data: Optional[Dict[str, Any]] = None,
        output_data: Optional[Dict[str, Any]] = None,
        execution_time_ms: Optional[int] = None
    ) -> NodeIO:
        """
        Save node input/output data.
        
        Args:
            prompt_id: Prompt ID
            node_id: Node ID
            input_data: Optional input data
            output_data: Optional output data
            execution_time_ms: Optional execution time in milliseconds
            
        Returns:
            Created NodeIO instance
        """
        node_io = self.repository.create_with_user({
            'prompt_id': prompt_id,
            'node_id': node_id,
            'input_data': input_data,
            'output_data': output_data,
            'execution_time_ms': execution_time_ms,
        })
        
        logger.debug(
            f"Saved NodeIO for node {node_id} in prompt {prompt_id}"
        )
        return node_io
    
    def get_node_io_by_prompt(
        self,
        prompt_id: str,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[NodeIO]:
        """
        Get all NodeIO records for a prompt.
        
        Args:
            prompt_id: Prompt ID
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of NodeIO records
            
        Raises:
            PermissionError: If user doesn't own the prompt
        """
        # Build query
        query = select(NodeIO).where(NodeIO.prompt_id == prompt_id)
        
        # Add user filter if not admin
        if not self.is_admin:
            query = query.where(NodeIO.user_id == self.user_id)
        
        # Order by created_at
        query = query.order_by(NodeIO.created_at)
        
        # Add pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        # Execute query
        result = self.session.execute(query)
        records = list(result.scalars().all())
        
        # Validate ownership (if no records found, check if prompt exists)
        if not self.is_admin and records:
            # Check if any record belongs to user
            if records[0].user_id != self.user_id:
                logger.warning(
                    f"User '{self.user_id}' attempted to access "
                    f"NodeIO owned by '{records[0].user_id}'"
                )
                raise PermissionError(
                    "You don't have permission to access this data"
                )
        
        return records
    
    def get_node_io_by_node(
        self,
        prompt_id: str,
        node_id: str
    ) -> Optional[NodeIO]:
        """
        Get NodeIO for a specific node in a prompt.
        
        Args:
            prompt_id: Prompt ID
            node_id: Node ID
            
        Returns:
            NodeIO instance or None
        """
        # Build query
        query = select(NodeIO).where(
            and_(
                NodeIO.prompt_id == prompt_id,
                NodeIO.node_id == node_id
            )
        )
        
        # Add user filter if not admin
        if not self.is_admin:
            query = query.where(NodeIO.user_id == self.user_id)
        
        # Execute query
        result = self.session.execute(query)
        return result.scalar_one_or_none()
    
    def delete_by_prompt(
        self,
        prompt_id: str
    ) -> int:
        """
        Delete all NodeIO records for a prompt.
        
        Args:
            prompt_id: Prompt ID
            
        Returns:
            Number of records deleted
            
        Raises:
            PermissionError: If user doesn't own the prompt
        """
        # Get records to validate ownership
        records = self.get_node_io_by_prompt(prompt_id)
        
        if not records:
            return 0
        
        # Delete records
        count = 0
        for record in records:
            self.session.delete(record)
            count += 1
        
        self.session.commit()
        
        logger.info(f"Deleted {count} NodeIO records for prompt {prompt_id}")
        return count
    
    def get_execution_statistics(
        self,
        prompt_id: str
    ) -> Dict[str, Any]:
        """
        Get execution statistics for a prompt.
        
        Args:
            prompt_id: Prompt ID
            
        Returns:
            Dictionary with statistics
        """
        records = self.get_node_io_by_prompt(prompt_id)
        
        if not records:
            return {
                'total_nodes': 0,
                'total_time_ms': 0,
                'average_time_ms': 0,
                'nodes_with_output': 0,
            }
        
        # Calculate statistics
        total_time = sum(
            r.execution_time_ms for r in records 
            if r.execution_time_ms is not None
        )
        nodes_with_output = sum(
            1 for r in records if r.output_data is not None
        )
        
        return {
            'total_nodes': len(records),
            'total_time_ms': total_time,
            'average_time_ms': total_time / len(records) if records else 0,
            'nodes_with_output': nodes_with_output,
        }
    
    def get_slowest_nodes(
        self,
        prompt_id: str,
        limit: int = 10
    ) -> List[NodeIO]:
        """
        Get the slowest nodes in a prompt.
        
        Args:
            prompt_id: Prompt ID
            limit: Maximum number of results
            
        Returns:
            List of NodeIO records ordered by execution time
        """
        # Build query
        query = select(NodeIO).where(
            and_(
                NodeIO.prompt_id == prompt_id,
                NodeIO.execution_time_ms.isnot(None)
            )
        )
        
        # Add user filter if not admin
        if not self.is_admin:
            query = query.where(NodeIO.user_id == self.user_id)
        
        # Order by execution time descending
        query = query.order_by(desc(NodeIO.execution_time_ms))
        query = query.limit(limit)
        
        # Execute query
        result = self.session.execute(query)
        return list(result.scalars().all())
    
    def count_by_prompt(
        self,
        prompt_id: str
    ) -> int:
        """
        Count NodeIO records for a prompt.
        
        Args:
            prompt_id: Prompt ID
            
        Returns:
            Count of records
        """
        from sqlalchemy import func
        
        # Build query
        query = select(func.count()).select_from(NodeIO).where(
            NodeIO.prompt_id == prompt_id
        )
        
        # Add user filter if not admin
        if not self.is_admin:
            query = query.where(NodeIO.user_id == self.user_id)
        
        # Execute query
        result = self.session.execute(query)
        return result.scalar_one()
    
    def batch_save_node_io(
        self,
        prompt_id: str,
        node_data_list: List[Dict[str, Any]]
    ) -> List[NodeIO]:
        """
        Batch save multiple node I/O records.
        
        Args:
            prompt_id: Prompt ID
            node_data_list: List of node data dictionaries
                Each dict should contain: node_id, input_data, output_data, execution_time_ms
                
        Returns:
            List of created NodeIO instances
        """
        records = []
        
        for node_data in node_data_list:
            node_io = self.save_node_io(
                prompt_id=prompt_id,
                node_id=node_data.get('node_id'),
                input_data=node_data.get('input_data'),
                output_data=node_data.get('output_data'),
                execution_time_ms=node_data.get('execution_time_ms'),
            )
            records.append(node_io)
        
        logger.info(
            f"Batch saved {len(records)} NodeIO records for prompt {prompt_id}"
        )
        return records
