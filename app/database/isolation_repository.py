"""
Data Isolation Repository

Provides a base repository class with built-in user data isolation.
All queries automatically filter by user_id unless the user is an admin.
"""

import logging
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session

from app.database.models import Base

logger = logging.getLogger(__name__)

# Generic type for ORM models
ModelType = TypeVar("ModelType", bound=Base)


class PermissionError(Exception):
    """Raised when a user tries to access data they don't own."""
    pass


class DataIsolationRepository(Generic[ModelType]):
    """
    Base repository with automatic user data isolation.
    
    All query methods automatically filter by user_id/owner_id
    unless the user has admin privileges.
    """
    
    def __init__(
        self,
        session: Session,
        model_class: Type[ModelType],
        user_id: str,
        is_admin: bool = False
    ):
        """
        Initialize the repository.
        
        Args:
            session: SQLAlchemy session
            model_class: ORM model class
            user_id: Current user's ID
            is_admin: Whether the user has admin privileges
        """
        self.session = session
        self.model_class = model_class
        self.user_id = user_id
        self.is_admin = is_admin
    
    def _get_user_id_column(self) -> Optional[str]:
        """
        Get the name of the user ID column for this model.
        
        Checks for 'user_id' first, then 'owner_id'.
        
        Returns:
            Column name or None if not found
        """
        # Check for user_id column
        if hasattr(self.model_class, 'user_id'):
            return 'user_id'
        
        # Check for owner_id column
        if hasattr(self.model_class, 'owner_id'):
            return 'owner_id'
        
        return None
    
    def query_with_user_filter(
        self,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[List[Any]] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = 0
    ) -> List[ModelType]:
        """
        Query records with automatic user filtering.
        
        Args:
            filters: Additional filter conditions
            order_by: Ordering criteria
            limit: Maximum number of results
            offset: Result offset for pagination
            
        Returns:
            List of model instances
        """
        # Build base query
        query = select(self.model_class)
        
        # Add user filter if not admin
        if not self.is_admin:
            user_column = self._get_user_id_column()
            if user_column:
                query = query.where(
                    getattr(self.model_class, user_column) == self.user_id
                )
        
        # Add additional filters
        if filters:
            conditions = []
            for key, value in filters.items():
                if hasattr(self.model_class, key):
                    conditions.append(
                        getattr(self.model_class, key) == value
                    )
            if conditions:
                query = query.where(and_(*conditions))
        
        # Add ordering
        if order_by:
            query = query.order_by(*order_by)
        
        # Add pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        # Execute query
        result = self.session.execute(query)
        return list(result.scalars().all())
    
    def get_by_id_with_check(
        self,
        record_id: str,
        id_column: str = 'id'
    ) -> ModelType:
        """
        Get a record by ID with ownership validation.
        
        Args:
            record_id: Record ID
            id_column: Name of the ID column
            
        Returns:
            Model instance
            
        Raises:
            PermissionError: If user doesn't own the record
            ValueError: If record not found
        """
        # Build query
        query = select(self.model_class).where(
            getattr(self.model_class, id_column) == record_id
        )
        
        result = self.session.execute(query)
        record = result.scalar_one_or_none()
        
        if record is None:
            raise ValueError(f"Record not found: {record_id}")
        
        # Check ownership (skip for admins)
        if not self.is_admin:
            user_column = self._get_user_id_column()
            if user_column:
                record_user_id = getattr(record, user_column)
                if record_user_id != self.user_id:
                    logger.warning(
                        f"User '{self.user_id}' attempted to access "
                        f"record owned by '{record_user_id}'"
                    )
                    raise PermissionError(
                        f"You don't have permission to access this record"
                    )
        
        return record
    
    def create_with_user(
        self,
        data: Dict[str, Any]
    ) -> ModelType:
        """
        Create a new record with automatic user binding.
        
        Args:
            data: Record data
            
        Returns:
            Created model instance
        """
        # Automatically set user_id/owner_id
        user_column = self._get_user_id_column()
        if user_column and user_column not in data:
            data[user_column] = self.user_id
        
        # Create instance
        instance = self.model_class(**data)
        
        # Add to session and commit
        self.session.add(instance)
        self.session.commit()
        self.session.refresh(instance)
        
        logger.debug(
            f"Created {self.model_class.__name__} with {user_column}={self.user_id}"
        )
        
        return instance
    
    def update_with_check(
        self,
        record_id: str,
        data: Dict[str, Any],
        id_column: str = 'id'
    ) -> ModelType:
        """
        Update a record with ownership validation.
        
        Args:
            record_id: Record ID
            data: Update data
            id_column: Name of the ID column
            
        Returns:
            Updated model instance
            
        Raises:
            PermissionError: If user doesn't own the record
        """
        # Get record with ownership check
        record = self.get_by_id_with_check(record_id, id_column)
        
        # Update fields
        for key, value in data.items():
            if hasattr(record, key):
                setattr(record, key, value)
        
        # Commit changes
        self.session.commit()
        self.session.refresh(record)
        
        logger.debug(f"Updated {self.model_class.__name__} {record_id}")
        
        return record
    
    def delete_with_check(
        self,
        record_id: str,
        id_column: str = 'id'
    ) -> bool:
        """
        Delete a record with ownership validation.
        
        Args:
            record_id: Record ID
            id_column: Name of the ID column
            
        Returns:
            True if deleted
            
        Raises:
            PermissionError: If user doesn't own the record
        """
        # Get record with ownership check
        record = self.get_by_id_with_check(record_id, id_column)
        
        # Delete record
        self.session.delete(record)
        self.session.commit()
        
        logger.debug(f"Deleted {self.model_class.__name__} {record_id}")
        
        return True
    
    def count_with_user_filter(
        self,
        filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Count records with automatic user filtering.
        
        Args:
            filters: Additional filter conditions
            
        Returns:
            Count of records
        """
        from sqlalchemy import func
        
        # Build base query
        query = select(func.count()).select_from(self.model_class)
        
        # Add user filter if not admin
        if not self.is_admin:
            user_column = self._get_user_id_column()
            if user_column:
                query = query.where(
                    getattr(self.model_class, user_column) == self.user_id
                )
        
        # Add additional filters
        if filters:
            conditions = []
            for key, value in filters.items():
                if hasattr(self.model_class, key):
                    conditions.append(
                        getattr(self.model_class, key) == value
                    )
            if conditions:
                query = query.where(and_(*conditions))
        
        # Execute query
        result = self.session.execute(query)
        return result.scalar_one()
    
    def exists_with_user_filter(
        self,
        record_id: str,
        id_column: str = 'id'
    ) -> bool:
        """
        Check if a record exists and is owned by the user.
        
        Args:
            record_id: Record ID
            id_column: Name of the ID column
            
        Returns:
            True if exists and owned
        """
        try:
            self.get_by_id_with_check(record_id, id_column)
            return True
        except (ValueError, PermissionError):
            return False
    
    def batch_check_ownership(
        self,
        record_ids: List[str],
        id_column: str = 'id'
    ) -> Dict[str, bool]:
        """
        Check ownership for multiple records in a single query.
        
        Args:
            record_ids: List of record IDs
            id_column: Name of the ID column
            
        Returns:
            Dictionary mapping record_id to ownership status
        """
        if not record_ids:
            return {}
        
        # Admins own all records
        if self.is_admin:
            return {record_id: True for record_id in record_ids}
        
        # Build query to get all records
        query = select(self.model_class).where(
            getattr(self.model_class, id_column).in_(record_ids)
        )
        
        result = self.session.execute(query)
        records = result.scalars().all()
        
        # Build ownership map
        user_column = self._get_user_id_column()
        ownership_map = {record_id: False for record_id in record_ids}
        
        if user_column:
            for record in records:
                record_id = getattr(record, id_column)
                record_user_id = getattr(record, user_column)
                ownership_map[record_id] = (record_user_id == self.user_id)
        else:
            # No user column, all records are owned
            for record in records:
                record_id = getattr(record, id_column)
                ownership_map[record_id] = True
        
        return ownership_map
    
    def query_with_join_and_user_filter(
        self,
        join_model: Type[Base],
        join_condition: Any,
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[List[Any]] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = 0
    ) -> List[tuple]:
        """
        Query with join and automatic user filtering.
        
        Args:
            join_model: Model to join with
            join_condition: Join condition
            filters: Additional filter conditions
            order_by: Ordering criteria
            limit: Maximum number of results
            offset: Result offset for pagination
            
        Returns:
            List of tuples (main_model, join_model)
        """
        # Build base query with join
        query = select(self.model_class, join_model).join(
            join_model, join_condition
        )
        
        # Add user filter if not admin
        if not self.is_admin:
            user_column = self._get_user_id_column()
            if user_column:
                query = query.where(
                    getattr(self.model_class, user_column) == self.user_id
                )
        
        # Add additional filters
        if filters:
            conditions = []
            for key, value in filters.items():
                # Check if key belongs to main model or join model
                if hasattr(self.model_class, key):
                    conditions.append(
                        getattr(self.model_class, key) == value
                    )
                elif hasattr(join_model, key):
                    conditions.append(
                        getattr(join_model, key) == value
                    )
            if conditions:
                query = query.where(and_(*conditions))
        
        # Add ordering
        if order_by:
            query = query.order_by(*order_by)
        
        # Add pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        # Execute query
        result = self.session.execute(query)
        return list(result.all())
