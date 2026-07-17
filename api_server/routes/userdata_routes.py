"""
User data routes for user-specific files like custom CSS.
"""

import os
import logging
from aiohttp import web
from folder_paths import get_user_directory

routes = web.RouteTableDef()


@routes.get("/api/userdata/user.css")
async def get_user_css(request):
    """
    Return user custom CSS file.

    If the user has a custom CSS file, return it.
    Otherwise, return empty CSS content.
    Requires comfy-user header for authentication.
    """
    try:
        # Require user_id from header
        user_id = (request.headers.get("comfy-user") or request.cookies.get("comfy-user"))
        if not user_id:
            return web.Response(status=401, text="Authentication required: comfy-user header is missing or empty")

        user_dir = get_user_directory()
        user_css_path = os.path.join(user_dir, user_id, "user.css")

        if os.path.exists(user_css_path):
            return web.FileResponse(user_css_path)
    except Exception as e:
        logging.debug(f"Error loading user.css: {e}")

    # Return empty CSS if not found
    return web.Response(
        text="/* No user custom CSS */",
        content_type="text/css"
    )
