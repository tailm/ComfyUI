"""
3D Asset Service

Provides user-isolated access to 3D model asset management.
"""

import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, and_, desc
from sqlalchemy.orm import Session

from app.assets.database.models import Asset, AssetReference
from app.database.isolation_repository import DataIsolationRepository, PermissionError
from app.assets.helpers import get_utc_now

logger = logging.getLogger(__name__)


class Asset3DService:
    """
    Service for managing 3D model assets with user isolation.
    
    All methods enforce owner_id filtering to ensure data isolation.
    """
    
    # Supported 3D file formats
    SUPPORTED_FORMATS = {
        'glb': 'model/gltf-binary',
        'gltf': 'model/gltf+json',
        'obj': 'model/obj',
        'fbx': 'model/fbx',
        'stl': 'model/stl',
        'usdz': 'model/usdz',
    }
    
    def __init__(
        self,
        session: Session,
        user_id: str,
        is_admin: bool = False
    ):
        """
        Initialize the 3D asset service.
        
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
    
    def register_3d_asset(
        self,
        file_path: str,
        name: str,
        format: str = 'glb',
        metadata: Optional[Dict[str, Any]] = None
    ) -> AssetReference:
        """
        Register a 3D model file as an asset.
        
        Args:
            file_path: Path to the 3D file
            name: Asset name
            format: File format (glb, gltf, obj, fbx, stl, usdz)
            metadata: Optional metadata dictionary
            
        Returns:
            Created AssetReference object
        """
        # Validate format
        if format.lower() not in self.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported 3D format: {format}")
        
        # Get file info
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"3D file not found: {file_path}")
        
        file_size = os.path.getsize(file_path)
        mime_type = self.SUPPORTED_FORMATS[format.lower()]
        
        # Calculate file hash
        import hashlib
        with open(file_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        
        # Create or get Asset
        stmt = select(Asset).where(Asset.hash == file_hash)
        result = self.session.execute(stmt)
        asset = result.scalar_one_or_none()
        
        if asset is None:
            asset = Asset(
                hash=file_hash,
                size_bytes=file_size,
                mime_type=mime_type
            )
            self.session.add(asset)
            self.session.flush()
        
        # Create AssetReference
        asset_ref = AssetReference(
            asset_id=asset.id,
            owner_id=self.user_id,
            name=name,
            file_path=file_path,
            user_metadata=metadata or {},
            system_metadata={
                'format': format,
                'mime_type': mime_type,
                'size_bytes': file_size,
                'registered_at': get_utc_now().isoformat()
            }
        )
        self.session.add(asset_ref)
        self.session.commit()
        
        logger.info(f"Registered 3D asset '{name}' for user '{self.user_id}'")
        
        return asset_ref
    
    def list_3d_assets(
        self,
        format: Optional[str] = None,
        order_by: str = 'created_at',
        order_desc: bool = True,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[AssetReference]:
        """
        List 3D model assets with automatic user filtering.
        
        Args:
            format: Filter by format (glb, gltf, obj, etc.)
            order_by: Field to order by
            order_desc: Whether to order descending
            limit: Maximum number of results
            offset: Offset for pagination
            
        Returns:
            List of asset references
        """
        filters = {}
        
        # Filter by MIME type for 3D formats
        if format and format.lower() in self.SUPPORTED_FORMATS:
            # We'll filter by system_metadata.format in application layer
            pass
        
        # Build order criteria
        order_criteria = []
        if hasattr(AssetReference, order_by):
            order_field = getattr(AssetReference, order_by)
            order_criteria.append(desc(order_field) if order_desc else order_field)
        
        # Query with user filter
        assets = self.repository.query_with_user_filter(
            filters=filters,
            order_by=order_criteria if order_criteria else None,
            limit=limit,
            offset=offset
        )
        
        # Filter by format in application layer
        if format:
            format_lower = format.lower()
            assets = [
                a for a in assets
                if a.system_metadata and 
                a.system_metadata.get('format', '').lower() == format_lower
            ]
        else:
            # Filter to only 3D assets
            assets = [
                a for a in assets
                if a.system_metadata and 
                a.system_metadata.get('format', '').lower() in self.SUPPORTED_FORMATS
            ]
        
        return assets
    
    def get_3d_asset(
        self,
        asset_id: str
    ) -> AssetReference:
        """
        Get a 3D asset by ID with ownership validation.
        
        Args:
            asset_id: Asset ID
            
        Returns:
            Asset reference
            
        Raises:
            PermissionError: If user doesn't own the asset
            ValueError: If asset not found
        """
        return self.repository.get_by_id_with_check(asset_id)
    
    def delete_3d_asset(
        self,
        asset_id: str,
        delete_file: bool = False
    ) -> bool:
        """
        Delete a 3D asset.
        
        Args:
            asset_id: Asset ID
            delete_file: Whether to delete the actual file
            
        Returns:
            True if deleted
            
        Raises:
            PermissionError: If user doesn't own the asset
        """
        asset_ref = self.repository.get_by_id_with_check(asset_id)
        
        # Delete file if requested
        if delete_file and asset_ref.file_path:
            try:
                if os.path.exists(asset_ref.file_path):
                    os.remove(asset_ref.file_path)
                    logger.info(f"Deleted 3D file: {asset_ref.file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete 3D file: {e}")
        
        # Delete asset reference
        self.session.delete(asset_ref)
        self.session.commit()
        
        logger.info(f"Deleted 3D asset {asset_id} for user '{self.user_id}'")
        
        return True
    
    def get_3d_asset_statistics(self) -> Dict[str, Any]:
        """
        Get statistics for user's 3D assets.
        
        Returns:
            Dictionary with statistics
        """
        assets = self.list_3d_assets()
        
        # Count by format
        format_counts = {}
        total_size = 0
        
        for asset in assets:
            if asset.system_metadata:
                format_name = asset.system_metadata.get('format', 'unknown')
                format_counts[format_name] = format_counts.get(format_name, 0) + 1
            
            if asset.asset and asset.asset.size_bytes:
                total_size += asset.asset.size_bytes
        
        return {
            'total_assets': len(assets),
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'formats': format_counts
        }
