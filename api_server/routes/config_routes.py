"""
User Configuration API Routes

Provides REST API endpoints for user configuration management.
"""

import logging
from typing import Any, Dict

from aiohttp import web
from sqlalchemy.orm import Session

from app.database.db import create_session
from app.services.user_config_service import UserConfigService

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


async def get_config(request: web.Request) -> web.Response:
    """
    Get a configuration value.
    
    GET /config/{config_key}
    Query params:
        include_system: bool - Whether to include system defaults
    """
    config_key = request.match_info.get("config_key", None)
    if not config_key:
        return web.json_response(
            {'error': 'config_key is required'},
            status=400
        )
    
    include_system = request.rel_url.query.get("include_system", "true").lower() == "true"
    user_id = get_user_id_from_request(request)
    
    try:
        with create_session() as session:
            service = UserConfigService(session, user_id)
            value = service.get_config(config_key, include_system=include_system)
            
            if value is None:
                return web.json_response(
                    {'error': f'Config not found: {config_key}'},
                    status=404
                )
            
            return web.json_response({
                'config_key': config_key,
                'config_value': value
            })
    
    except Exception as e:
        logger.error(f"Failed to get config: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


async def set_config(request: web.Request) -> web.Response:
    """
    Set a configuration value.
    
    PUT /config/{config_key}
    Body:
        {
            "config_value": any,
            "config_type": "string" | "number" | "boolean" | "json" (optional),
            "is_encrypted": bool (optional)
        }
    """
    config_key = request.match_info.get("config_key", None)
    if not config_key:
        return web.json_response(
            {'error': 'config_key is required'},
            status=400
        )
    
    user_id = get_user_id_from_request(request)
    
    try:
        # Parse request body
        body = await request.json()
        config_value = body.get('config_value')
        config_type = body.get('config_type')
        is_encrypted = body.get('is_encrypted', False)
        
        if config_value is None:
            return web.json_response(
                {'error': 'config_value is required'},
                status=400
            )
        
        with create_session() as session:
            service = UserConfigService(session, user_id)
            config = service.set_config(
                config_key,
                config_value,
                config_type,
                is_encrypted
            )
            
            return web.json_response({
                'message': 'Config updated successfully',
                'config': config.to_dict()
            })
    
    except Exception as e:
        logger.error(f"Failed to set config: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


async def delete_config(request: web.Request) -> web.Response:
    """
    Delete a configuration value.
    
    DELETE /config/{config_key}
    """
    config_key = request.match_info.get("config_key", None)
    if not config_key:
        return web.json_response(
            {'error': 'config_key is required'},
            status=400
        )
    
    user_id = get_user_id_from_request(request)
    
    try:
        with create_session() as session:
            service = UserConfigService(session, user_id)
            deleted = service.delete_config(config_key)
            
            if not deleted:
                return web.json_response(
                    {'error': f'Config not found: {config_key}'},
                    status=404
                )
            
            return web.json_response({
                'message': 'Config deleted successfully'
            })
    
    except Exception as e:
        logger.error(f"Failed to delete config: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


async def list_configs(request: web.Request) -> web.Response:
    """
    List all configurations.
    
    GET /config
    Query params:
        prefix: str - Filter by key prefix
        include_system: bool - Whether to include system defaults
    """
    prefix = request.rel_url.query.get("prefix", None)
    include_system = request.rel_url.query.get("include_system", "false").lower() == "true"
    user_id = get_user_id_from_request(request)
    
    try:
        with create_session() as session:
            service = UserConfigService(session, user_id)
            configs = service.list_configs(prefix=prefix, include_system=include_system)
            
            return web.json_response({
                'configs': configs
            })
    
    except Exception as e:
        logger.error(f"Failed to list configs: {e}", exc_info=True)
        return web.json_response(
            {'error': str(e)},
            status=500
        )


def register_config_routes(routes: web.RouteTableDef) -> None:
    """
    Register configuration routes.
    
    Args:
        routes: Route table to register routes on
    """
    routes.get("/config")(list_configs)
    routes.get("/config/{config_key}")(get_config)
    routes.put("/config/{config_key}")(set_config)
    routes.delete("/config/{config_key}")(delete_config)
    
    logger.info("Registered user configuration routes")
