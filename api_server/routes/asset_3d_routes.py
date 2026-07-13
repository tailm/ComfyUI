"""
3D Asset API Routes

Provides REST API endpoints for 3D model asset management.
"""

import logging
import os
from typing import Any, Dict

from aiohttp import web
from sqlalchemy.orm import Session

from app.database.db import create_session
from app.services.asset_3d_service import Asset3DService

logger = logging.getLogger(__name__)


def get_user_id_from_request(request: web.Request) -> str:
    """
    Extract user ID from request.
    
    Args:
        request: HTTP request
        
    Returns:
        User ID string
    """
    # Try to get from header first
    user_id = request.headers.get("comfy-user", None)
    
    # Fall back to request context if available
    if not user_id:
        user_id = request.get("user_id", "0")
    
    return user_id


async def list_3d_assets(request: web.Request) -> web.Response:
    """
    List 3D model assets.
    
    GET /assets/3d
    Query params:
        format: str - Filter by format (glb, gltf, obj, etc.)
        limit: int - Maximum number of results
        offset: int - Offset for pagination
    """
    user_id = get_user_id_from_request(request)
    is_admin = request.get("is_admin", False)
    
    # Get query parameters
    format = request.rel_url.query.get("format", None)
    limit = request.rel_url.query.get("limit", None)
    offset = request.rel_url.query.get("offset", "0")
    
    try:
        limit = int(limit) if limit else None
        offset = int(offset)
    except ValueError:
        return web.json_response(
            {'error': 'Invalid limit or offset parameter'},
            status=400
        )
    
    try:
        with create_session() as session:
            service = Asset3DService(session, user_id, is_admin)
            assets = service.list_3d_assets(
                format=format,
                limit=limit,
                offset=offset
            )
            
            return web.json_response({
                'assets': [
                    {
                        'id': a.id,
                        'name': a.name,
                        'format': a.system_metadata.get('format') if a.system_metadata else None,
                        'size_bytes': a.asset.size_bytes if a.asset else 0,
                        'created_at': a.created_at.isoformat() if a.created_at else None,
                        'file_path': a.file_path
                    }
                    for a in assets
                ]
            })
    
    except Exception as e:
        logger.error(f"Failed to list 3D assets: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


async def get_3d_asset(request: web.Request) -> web.Response:
    """
    Get a 3D asset by ID.
    
    GET /assets/3d/{asset_id}
    """
    asset_id = request.match_info.get("asset_id", None)
    if not asset_id:
        return web.json_response(
            {'error': 'asset_id is required'},
            status=400
        )
    
    user_id = get_user_id_from_request(request)
    is_admin = request.get("is_admin", False)
    
    try:
        with create_session() as session:
            service = Asset3DService(session, user_id, is_admin)
            asset = service.get_3d_asset(asset_id)
            
            return web.json_response({
                'id': asset.id,
                'name': asset.name,
                'format': asset.system_metadata.get('format') if asset.system_metadata else None,
                'size_bytes': asset.asset.size_bytes if asset.asset else 0,
                'created_at': asset.created_at.isoformat() if asset.created_at else None,
                'file_path': asset.file_path,
                'metadata': asset.user_metadata
            })
    
    except PermissionError as e:
        return web.json_response(
            {'error': str(e)},
            status=403
        )
    
    except ValueError as e:
        return web.json_response(
            {'error': str(e)},
            status=404
        )
    
    except Exception as e:
        logger.error(f"Failed to get 3D asset: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


async def delete_3d_asset(request: web.Request) -> web.Response:
    """
    Delete a 3D asset.
    
    DELETE /assets/3d/{asset_id}
    Query params:
        delete_file: bool - Whether to delete the actual file
    """
    asset_id = request.match_info.get("asset_id", None)
    if not asset_id:
        return web.json_response(
            {'error': 'asset_id is required'},
            status=400
        )
    
    user_id = get_user_id_from_request(request)
    is_admin = request.get("is_admin", False)
    delete_file = request.rel_url.query.get("delete_file", "false").lower() == "true"
    
    try:
        with create_session() as session:
            service = Asset3DService(session, user_id, is_admin)
            deleted = service.delete_3d_asset(asset_id, delete_file=delete_file)
            
            return web.json_response({
                'message': '3D asset deleted successfully'
            })
    
    except PermissionError as e:
        return web.json_response(
            {'error': str(e)},
            status=403
        )
    
    except ValueError as e:
        return web.json_response(
            {'error': str(e)},
            status=404
        )
    
    except Exception as e:
        logger.error(f"Failed to delete 3D asset: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


async def get_3d_asset_statistics(request: web.Request) -> web.Response:
    """
    Get 3D asset statistics.
    
    GET /assets/3d/statistics
    """
    user_id = get_user_id_from_request(request)
    is_admin = request.get("is_admin", False)
    
    try:
        with create_session() as session:
            service = Asset3DService(session, user_id, is_admin)
            stats = service.get_3d_asset_statistics()
            
            return web.json_response(stats)
    
    except Exception as e:
        logger.error(f"Failed to get 3D asset statistics: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


async def register_3d_asset(request: web.Request) -> web.Response:
    """
    Register a 3D asset.
    
    POST /assets/3d
    Body:
        {
            "file_path": str,
            "name": str,
            "format": str (optional, default: "glb"),
            "metadata": dict (optional)
        }
    """
    user_id = get_user_id_from_request(request)
    is_admin = request.get("is_admin", False)
    
    try:
        body = await request.json()
        file_path = body.get('file_path')
        name = body.get('name')
        format = body.get('format', 'glb')
        metadata = body.get('metadata')
        
        if not file_path or not name:
            return web.json_response(
                {'error': 'file_path and name are required'},
                status=400
            )
        
        with create_session() as session:
            service = Asset3DService(session, user_id, is_admin)
            asset = service.register_3d_asset(
                file_path,
                name,
                format,
                metadata
            )
            
            return web.json_response({
                'message': '3D asset registered successfully',
                'asset': {
                    'id': asset.id,
                    'name': asset.name,
                    'format': asset.system_metadata.get('format') if asset.system_metadata else None
                }
            })
    
    except Exception as e:
        logger.error(f"Failed to register 3D asset: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


def register_3d_asset_routes(routes: web.RouteTableDef) -> None:
    """
    Register 3D asset routes.
    
    Args:
        routes: Route table to register routes on
    """
    routes.get("/assets/3d/statistics")(get_3d_asset_statistics)
    routes.get("/assets/3d")(list_3d_assets)
    routes.get("/assets/3d/{asset_id}")(get_3d_asset)
    routes.delete("/assets/3d/{asset_id}")(delete_3d_asset)
    routes.post("/assets/3d")(register_3d_asset)
    
    logger.info("Registered 3D asset routes")
