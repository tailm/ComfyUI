import importlib
import logging
from pathlib import Path
from typing import Dict, Optional

from aiohttp import web
from importlib.metadata import version

from utils.install_util import get_required_packages_versions


def parse_version(version: str) -> tuple[int, int, int]:
        return tuple(map(int, version.split(".")))


class FrontendManager:
    @classmethod
    def local_frontend_path(cls) -> str:
        """Return the path to the local web/ directory for frontend files."""
        return str(Path(__file__).parents[1] / "web")

    @classmethod
    def get_installed_templates_version(cls) -> str:
        """Get the currently installed workflow templates package version."""
        try:
            templates_version_str = version("comfyui-workflow-templates")
            return templates_version_str
        except Exception:
            return None

    @classmethod
    def get_required_templates_version(cls) -> str:
        return get_required_packages_versions().get("comfyui-workflow-templates", None)

    @classmethod
    def template_asset_map(cls) -> Optional[Dict[str, str]]:
        """Return a mapping of template asset names to their absolute paths."""
        try:
            from comfyui_workflow_templates import (
                get_asset_path,
                iter_templates,
            )
        except ImportError:
            logging.error("comfyui-workflow-templates is not installed.")
            return None

        try:
            template_entries = list(iter_templates())
        except Exception as exc:
            logging.error(f"Failed to enumerate workflow templates: {exc}")
            return None

        asset_map: Dict[str, str] = {}
        try:
            for entry in template_entries:
                for asset in entry.assets:
                    asset_map[asset.filename] = get_asset_path(
                        entry.template_id, asset.filename
                    )
        except Exception as exc:
            logging.error(f"Failed to resolve template asset paths: {exc}")
            return None

        if not asset_map:
            logging.error("No workflow template assets found. Did the packages install correctly?")
            return None

        return asset_map

    @classmethod
    def legacy_templates_path(cls) -> Optional[str]:
        """Return the legacy templates directory shipped inside the meta package."""
        try:
            import comfyui_workflow_templates

            return str(
                importlib.resources.files(comfyui_workflow_templates) / "templates"
            )
        except ImportError:
            logging.error("comfyui-workflow-templates is not installed.")
            return None

    @classmethod
    def embedded_docs_path(cls) -> str:
        """Get the path to embedded documentation"""
        try:
            import comfyui_embedded_docs

            return str(
                importlib.resources.files(comfyui_embedded_docs) / "docs"
            )
        except ImportError:
            logging.info("comfyui-embedded-docs package not found")
            return None

    @classmethod
    def template_asset_handler(cls):
        assets = cls.template_asset_map()
        if not assets:
            return None

        async def serve_template(request: web.Request) -> web.StreamResponse:
            rel_path = request.match_info.get("path", "")
            target = assets.get(rel_path)
            if target is None:
                raise web.HTTPNotFound()
            return web.FileResponse(target)

        return serve_template
