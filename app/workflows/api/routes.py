"""
Workflow API Routes

Provides REST API endpoints for workflow management with user isolation.
"""

import logging
from aiohttp import web
from typing import Any, Dict

from app.services.workflow_service import WorkflowService
from app.database.isolation_repository import PermissionError

logger = logging.getLogger(__name__)

routes = web.RouteTableDef()


@routes.get("/workflows")
async def list_workflows(request: web.Request) -> web.Response:
    """
    List workflows for the current user.
    
    Query params:
        include_templates: bool - Include public templates (default: false)
        limit: int - Maximum number of results
        offset: int - Offset for pagination
    
    Returns:
        JSON response with list of workflows
    """
    try:
        # Get user context from request (injected by middleware)
        user_id = request.get('user_id')
        is_admin = request.get('is_admin', False)
        
        # Get query parameters
        include_templates = request.rel_url.query.get('include_templates', 'false').lower() == 'true'
        limit = request.rel_url.query.get('limit')
        offset = int(request.rel_url.query.get('offset', '0'))
        
        if limit:
            limit = int(limit)
        
        # Get database session
        session = request.app['db_session']
        
        # Create service
        workflow_service = WorkflowService(
            session=session,
            user_id=user_id,
            is_admin=is_admin
        )
        
        # List workflows
        workflows = workflow_service.list_workflows(
            include_templates=include_templates,
            limit=limit,
            offset=offset
        )
        
        # Convert to JSON
        result = [
            {
                'id': wf.id,
                'name': wf.name,
                'description': wf.description,
                'is_template': wf.is_template,
                'created_at': wf.created_at.isoformat(),
                'updated_at': wf.updated_at.isoformat(),
                'last_used_at': wf.last_used_at.isoformat() if wf.last_used_at else None,
            }
            for wf in workflows
        ]
        
        return web.json_response({'workflows': result})
        
    except Exception as e:
        logger.error(f"Error listing workflows: {e}")
        return web.json_response(
            {'error': str(e)},
            status=500
        )


@routes.get("/workflows/{workflow_id}")
async def get_workflow(request: web.Request) -> web.Response:
    """
    Get a specific workflow by ID.
    
    Path params:
        workflow_id: str - Workflow ID
    
    Returns:
        JSON response with workflow details
    """
    try:
        # Get user context
        user_id = request.get('user_id')
        is_admin = request.get('is_admin', False)
        
        # Get workflow ID
        workflow_id = request.match_info['workflow_id']
        
        # Get database session
        session = request.app['db_session']
        
        # Create service
        workflow_service = WorkflowService(
            session=session,
            user_id=user_id,
            is_admin=is_admin
        )
        
        # Get workflow
        workflow = workflow_service.get_workflow(workflow_id)
        
        # Convert to JSON
        result = {
            'id': workflow.id,
            'name': workflow.name,
            'workflow_json': workflow.workflow_json,
            'description': workflow.description,
            'is_template': workflow.is_template,
            'created_at': workflow.created_at.isoformat(),
            'updated_at': workflow.updated_at.isoformat(),
            'last_used_at': workflow.last_used_at.isoformat() if workflow.last_used_at else None,
        }
        
        return web.json_response(result)
        
    except PermissionError as e:
        logger.warning(f"Permission denied: {e}")
        return web.json_response(
            {'error': 'Permission denied'},
            status=403
        )
    except ValueError as e:
        logger.warning(f"Workflow not found: {e}")
        return web.json_response(
            {'error': 'Workflow not found'},
            status=404
        )
    except Exception as e:
        logger.error(f"Error getting workflow: {e}")
        return web.json_response(
            {'error': str(e)},
            status=500
        )


@routes.post("/workflows")
async def save_workflow(request: web.Request) -> web.Response:
    """
    Save a workflow (create or update).
    
    Request body:
        {
            "name": str,
            "workflow_json": dict,
            "description": str (optional),
            "is_template": bool (optional),
            "workflow_id": str (optional, for update)
        }
    
    Returns:
        JSON response with saved workflow
    """
    try:
        # Get user context
        user_id = request.get('user_id')
        is_admin = request.get('is_admin', False)
        
        # Parse request body
        data = await request.json()
        
        # Get database session
        session = request.app['db_session']
        
        # Create service
        workflow_service = WorkflowService(
            session=session,
            user_id=user_id,
            is_admin=is_admin
        )
        
        # Save workflow
        workflow = workflow_service.save_workflow(
            name=data['name'],
            workflow_json=data['workflow_json'],
            description=data.get('description'),
            is_template=data.get('is_template', False),
            workflow_id=data.get('workflow_id')
        )
        
        # Return result
        result = {
            'id': workflow.id,
            'name': workflow.name,
            'created_at': workflow.created_at.isoformat(),
            'updated_at': workflow.updated_at.isoformat(),
        }
        
        return web.json_response(result)
        
    except PermissionError as e:
        logger.warning(f"Permission denied: {e}")
        return web.json_response(
            {'error': 'Permission denied'},
            status=403
        )
    except Exception as e:
        logger.error(f"Error saving workflow: {e}")
        return web.json_response(
            {'error': str(e)},
            status=500
        )


@routes.delete("/workflows/{workflow_id}")
async def delete_workflow(request: web.Request) -> web.Response:
    """
    Delete a workflow.
    
    Path params:
        workflow_id: str - Workflow ID
    
    Returns:
        JSON response with success status
    """
    try:
        # Get user context
        user_id = request.get('user_id')
        is_admin = request.get('is_admin', False)
        
        # Get workflow ID
        workflow_id = request.match_info['workflow_id']
        
        # Get database session
        session = request.app['db_session']
        
        # Create service
        workflow_service = WorkflowService(
            session=session,
            user_id=user_id,
            is_admin=is_admin
        )
        
        # Delete workflow
        workflow_service.delete_workflow(workflow_id)
        
        return web.json_response({'success': True})
        
    except PermissionError as e:
        logger.warning(f"Permission denied: {e}")
        return web.json_response(
            {'error': 'Permission denied'},
            status=403
        )
    except ValueError as e:
        logger.warning(f"Workflow not found: {e}")
        return web.json_response(
            {'error': 'Workflow not found'},
            status=404
        )
    except Exception as e:
        logger.error(f"Error deleting workflow: {e}")
        return web.json_response(
            {'error': str(e)},
            status=500
        )


@routes.get("/workflows/templates")
async def get_templates(request: web.Request) -> web.Response:
    """
    Get public workflow templates.
    
    Query params:
        limit: int - Maximum number of results
        offset: int - Offset for pagination
    
    Returns:
        JSON response with list of template workflows
    """
    try:
        # Get user context
        user_id = request.get('user_id')
        is_admin = request.get('is_admin', False)
        
        # Get query parameters
        limit = request.rel_url.query.get('limit')
        offset = int(request.rel_url.query.get('offset', '0'))
        
        if limit:
            limit = int(limit)
        
        # Get database session
        session = request.app['db_session']
        
        # Create service
        workflow_service = WorkflowService(
            session=session,
            user_id=user_id,
            is_admin=is_admin
        )
        
        # Get templates
        templates = workflow_service.get_templates(
            limit=limit,
            offset=offset
        )
        
        # Convert to JSON
        result = [
            {
                'id': t.id,
                'name': t.name,
                'description': t.description,
                'created_at': t.created_at.isoformat(),
                'updated_at': t.updated_at.isoformat(),
            }
            for t in templates
        ]
        
        return web.json_response({'templates': result})
        
    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        return web.json_response(
            {'error': str(e)},
            status=500
        )


@routes.post("/workflows/{workflow_id}/duplicate")
async def duplicate_workflow(request: web.Request) -> web.Response:
    """
    Duplicate a workflow.
    
    Path params:
        workflow_id: str - Source workflow ID
    
    Request body (optional):
        {
            "new_name": str - New workflow name
        }
    
    Returns:
        JSON response with duplicated workflow
    """
    try:
        # Get user context
        user_id = request.get('user_id')
        is_admin = request.get('is_admin', False)
        
        # Get workflow ID
        workflow_id = request.match_info['workflow_id']
        
        # Parse request body (optional)
        try:
            data = await request.json()
            new_name = data.get('new_name')
        except:
            new_name = None
        
        # Get database session
        session = request.app['db_session']
        
        # Create service
        workflow_service = WorkflowService(
            session=session,
            user_id=user_id,
            is_admin=is_admin
        )
        
        # Duplicate workflow
        workflow = workflow_service.duplicate_workflow(
            workflow_id=workflow_id,
            new_name=new_name
        )
        
        # Return result
        result = {
            'id': workflow.id,
            'name': workflow.name,
            'created_at': workflow.created_at.isoformat(),
        }
        
        return web.json_response(result)
        
    except PermissionError as e:
        logger.warning(f"Permission denied: {e}")
        return web.json_response(
            {'error': 'Permission denied'},
            status=403
        )
    except Exception as e:
        logger.error(f"Error duplicating workflow: {e}")
        return web.json_response(
            {'error': str(e)},
            status=500
        )


def register_workflow_routes(app: web.Application):
    """Register workflow routes with the application."""
    app.router.add_routes(routes)
    logger.info("Workflow API routes registered")
