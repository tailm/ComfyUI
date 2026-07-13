"""
Asset Service

Provides user-isolated access to asset management.
"""

import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select, and_, desc
from sqlalchemy.orm import Session

from app.assets.database.models import AssetReference
from app.database.isolation_repository import DataIsolationRepository, PermissionError

logger = logging.getLogger(__name__)


class AssetService:
    """
    Service for managing assets with user isolation.
    
    All methods enforce owner_id filtering to ensure data isolation.
    """
    
    def __init__(
        self,
        session: Session,
        user_id: str,
        is_admin: bool = False
    ):
        """
        Initialize the asset service.
        
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
            model_class=AssetReference,
            user_id=user_id,
            is_admin=is_admin
        )
    
    def list_assets(
        self,
        filters: Optional[Dict[str, Any]] = None,
        order_by: str = 'created_at',
        order_desc: bool = True,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[AssetReference]:
        """
        List assets with automatic user filtering.
        
        Args:
            filters: Additional filter conditions
            order_by: Field to order by
            order_desc: Whether to order descending
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of asset references
        """
        # Build order criteria
        order_criteria = []
        if hasattr(AssetReference, order_by):
            order_field = getattr(AssetReference, order_by)
            order_criteria.append(desc(order_field) if order_desc else order_field)
        
        # Query with user filter
        return self.repository.query_with_user_filter(
            filters=filters,
            order_by=order_criteria if order_criteria else None,
            limit=limit,
            offset=offset
        )
    
    def get_asset(
        self,
        asset_id: str
    ) -> AssetReference:
        """
        Get an asset by ID with ownership validation.
        
        Args:
            asset_id: Asset ID
            
        Returns:
            Asset reference
            
        Raises:
            PermissionError: If user doesn't own the asset
            ValueError: If asset not found
        """
        return self.repository.get_by_id_with_check(asset_id)
    
    def create_asset(
        self,
        data: Dict[str, Any]
    ) -> AssetReference:
        """
        Create a new asset with automatic owner binding.
        
        Args:
            data: Asset data
            
        Returns:
            Created asset reference
        """
        # Ensure owner_id is set
        if 'owner_id' not in data:
            data['owner_id'] = self.user_id
        
        return self.repository.create_with_user(data)
    
    def update_asset(
        self,
        asset_id: str,
        data: Dict[str, Any]
    ) -> AssetReference:
        """
        Update an asset with ownership validation.
        
        Args:
            asset_id: Asset ID
            data: Update data
            
        Returns:
            Updated asset reference
            
        Raises:
            PermissionError: If user doesn't own the asset
        """
        # Prevent changing owner_id
        if 'owner_id' in data:
            del data['owner_id']
        
        return self.repository.update_with_check(asset_id, data)
    
    def delete_asset(
        self,
        asset_id: str
    ) -> bool:
        """
        Delete an asset with ownership validation.
        
        Args:
            asset_id: Asset ID
            
        Returns:
            True if deleted
            
        Raises:
            PermissionError: If user doesn't own the asset
        """
        return self.repository.delete_with_check(asset_id)
    
    def count_assets(
        self,
        filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Count assets with automatic user filtering.
        
        Args:
            filters: Additional filter conditions
            
        Returns:
            Count of assets
        """
        return self.repository.count_with_user_filter(filters)
    
    def asset_exists(
        self,
        asset_id: str
    ) -> bool:
        """
        Check if an asset exists and is owned by the user.
        
        Args:
            asset_id: Asset ID
            
        Returns:
            True if exists and owned
        """
        return self.repository.exists_with_user_filter(asset_id)
    
    def get_assets_by_tag(
        self,
        tag_name: str,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[AssetReference]:
        """
        Get assets by tag with user filtering.
        
        Args:
            tag_name: Tag name to filter by
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of asset references
        """
        # Build query with tag join
        query = select(AssetReference).where(
            AssetReference.tags.any(name=tag_name)
        )
        
        # Add user filter if not admin
        if not self.is_admin:
            query = query.where(AssetReference.owner_id == self.user_id)
        
        # Add ordering
        query = query.order_by(desc(AssetReference.created_at))
        
        # Add pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        # Execute query
        result = self.session.execute(query)
        return list(result.scalars().all())
    
    def search_assets(
        self,
        search_term: str,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[AssetReference]:
        """
        Search assets by name with user filtering.
        
        Args:
            search_term: Search term
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of matching asset references
        """
        # Build query with search
        query = select(AssetReference).where(
            AssetReference.name.ilike(f'%{search_term}%')
        )
        
        # Add user filter if not admin
        if not self.is_admin:
            query = query.where(AssetReference.owner_id == self.user_id)
        
        # Add ordering
        query = query.order_by(desc(AssetReference.created_at))
        
        # Add pagination
        if limit:
            query = query.limit(limit)
        if offset:
            query = query.offset(offset)
        
        # Execute query
        result = self.session.execute(query)
        return list(result.scalars().all())
    
    def get_user_statistics(self) -> Dict[str, Any]:
        """
        Get statistics for the current user's assets.
        
        Returns:
            Dictionary with statistics
        """
        # Count total assets
        total = self.count_assets()
        
        # Count by type (using mime_type)
        query = select(AssetReference)
        if not self.is_admin:
            query = query.where(AssetReference.owner_id == self.user_id)
        
        result = self.session.execute(query)
        assets = list(result.scalars().all())
        
        # Group by mime_type
        type_counts = {}
        for asset in assets:
            mime_type = asset.asset.mime_type or 'unknown'
            type_counts[mime_type] = type_counts.get(mime_type, 0) + 1
        
        # Calculate total size
        total_size = sum(asset.asset.size_bytes for asset in assets)
        
        return {
            'total_assets': total,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'by_type': type_counts
        }
