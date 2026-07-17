"""
User Directory Management

Provides functions for managing user-specific directories for data isolation.
New directory structure: {user_root}/{user_id}/output|input|temp/
"""

import os
import sys
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


def _get_user_directory() -> str:
    """Get the user_directory variable from folder_paths.__init__ module.

    This function avoids the naming conflict between the 'user_directory' variable
    in folder_paths.__init__ and the 'user_directory' submodule. When Python imports
    a submodule, it replaces the parent module's attribute with the submodule reference.
    We use sys.modules to directly access the __init__ module's namespace.
    """
    import folder_paths
    # Access the variable directly from the module's __dict__ to avoid submodule shadowing
    init_module = sys.modules.get('folder_paths')
    if init_module is not None and isinstance(getattr(init_module, 'user_directory', None), str):
        return init_module.user_directory
    # Fallback: use get_user_directory() function
    return folder_paths.get_user_directory()


def get_user_output_directory(user_id: str) -> str:
    """
    Get the output directory for a specific user.
    New structure: {user_directory}/{user_id}/output

    Args:
        user_id: User ID

    Returns:
        Path to user's output directory
    """
    # Get base user directory
    base_user = _get_user_directory()

    # Create user-specific output directory
    user_output = os.path.join(base_user, user_id, "output")

    # Create subdirectories
    images_dir = os.path.join(user_output, "images")
    temp_dir = os.path.join(user_output, "temp")
    cache_dir = os.path.join(user_output, "cache")

    # Ensure directories exist
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(temp_dir, exist_ok=True)
    os.makedirs(cache_dir, exist_ok=True)

    logger.debug(f"User output directory: {user_output}")
    return user_output


def get_user_data_directory(user_id: str) -> str:
    """
    Get the data directory for a specific user.
    New structure: {user_directory}/{user_id}

    Creates the directory structure if it doesn't exist:
    - {user_directory}/{user_id}/workflows
    - {user_directory}/{user_id}/prompts
    - {user_directory}/{user_id}/custom

    Args:
        user_id: User ID

    Returns:
        Path to user's data directory
    """
    import folder_paths as _fp

    # Get base user directory
    base_user = _get_user_directory()

    # Create user-specific directory
    user_data = os.path.join(base_user, user_id)

    # Create subdirectories
    workflows_dir = os.path.join(user_data, "workflows")
    prompts_dir = os.path.join(user_data, "prompts")
    custom_dir = os.path.join(user_data, "custom")

    # Ensure directories exist
    os.makedirs(workflows_dir, exist_ok=True)
    os.makedirs(prompts_dir, exist_ok=True)
    os.makedirs(custom_dir, exist_ok=True)

    logger.debug(f"User data directory: {user_data}")
    return user_data


def validate_user_path(
    file_path: str,
    user_id: str,
    allow_shared: bool = False
) -> bool:
    """
    Validate that a file path belongs to a user.

    Args:
        file_path: File path to validate
        user_id: User ID
        allow_shared: Whether to allow access to shared directories

    Returns:
        True if path is valid for user, False otherwise
    """
    import folder_paths as _fp

    # Normalize the path
    file_path = os.path.abspath(file_path)

    # Get user directory (new structure: {user_directory}/{user_id})
    user_dir = os.path.join(_get_user_directory(), user_id)

    # Normalize user directory
    user_dir = os.path.abspath(user_dir)

    # Check if path is under user's directory (covers output, input, temp, etc.)
    if file_path.startswith(user_dir + os.sep) or file_path == user_dir:
        return True

    # Check shared directories if allowed
    if allow_shared:
        # Allow access to input directory (shared)
        input_dir = os.path.abspath(_fp.input_directory)
        if file_path.startswith(input_dir):
            return True

        # Allow access to models directory (shared)
        models_dir = os.path.abspath(_fp.models_dir)
        if file_path.startswith(models_dir):
            return True

    logger.warning(
        f"Path validation failed: '{file_path}' not allowed for user '{user_id}'"
    )
    return False


def get_user_temp_directory(user_id: str) -> str:
    """
    Get the temp directory for a specific user.
    New structure: {user_directory}/{user_id}/temp

    Args:
        user_id: User ID

    Returns:
        Path to user's temp directory
    """
    import folder_paths as _fp

    base_user = _get_user_directory()
    temp_dir = os.path.join(base_user, user_id, "temp")
    os.makedirs(temp_dir, exist_ok=True)
    return temp_dir


def get_user_cache_directory(user_id: str) -> str:
    """
    Get the cache directory for a specific user.

    Args:
        user_id: User ID

    Returns:
        Path to user's cache directory
    """
    user_output = get_user_output_directory(user_id)
    cache_dir = os.path.join(user_output, "cache")
    os.makedirs(cache_dir, exist_ok=True)
    return cache_dir


def get_user_images_directory(user_id: str) -> str:
    """
    Get the images directory for a specific user.

    Args:
        user_id: User ID

    Returns:
        Path to user's images directory
    """
    user_output = get_user_output_directory(user_id)
    images_dir = os.path.join(user_output, "images")
    os.makedirs(images_dir, exist_ok=True)
    return images_dir


def get_user_workflows_directory(user_id: str) -> str:
    """
    Get the workflows directory for a specific user.

    Args:
        user_id: User ID

    Returns:
        Path to user's workflows directory
    """
    user_data = get_user_data_directory(user_id)
    workflows_dir = os.path.join(user_data, "workflows")
    os.makedirs(workflows_dir, exist_ok=True)
    return workflows_dir


def get_user_prompts_directory(user_id: str) -> str:
    """
    Get the prompts directory for a specific user.

    Args:
        user_id: User ID

    Returns:
        Path to user's prompts directory
    """
    user_data = get_user_data_directory(user_id)
    prompts_dir = os.path.join(user_data, "prompts")
    os.makedirs(prompts_dir, exist_ok=True)
    return prompts_dir


def cleanup_user_temp_files(user_id: str, max_age_hours: int = 24) -> int:
    """
    Clean up old temporary files for a user.

    Args:
        user_id: User ID
        max_age_hours: Maximum age of files in hours

    Returns:
        Number of files deleted
    """
    import time

    temp_dir = get_user_temp_directory(user_id)
    current_time = time.time()
    max_age_seconds = max_age_hours * 3600

    deleted_count = 0

    try:
        for filename in os.listdir(temp_dir):
            filepath = os.path.join(temp_dir, filename)

            # Check file age
            file_mtime = os.path.getmtime(filepath)
            age = current_time - file_mtime

            if age > max_age_seconds:
                try:
                    if os.path.isfile(filepath):
                        os.remove(filepath)
                        deleted_count += 1
                    elif os.path.isdir(filepath):
                        os.rmdir(filepath)
                        deleted_count += 1
                except Exception as e:
                    logger.warning(f"Failed to delete {filepath}: {e}")

        logger.info(
            f"Cleaned up {deleted_count} temp files for user {user_id}"
        )

    except Exception as e:
        logger.error(f"Error cleaning up temp files: {e}")

    return deleted_count


def get_user_disk_usage(user_id: str) -> dict:
    """
    Get disk usage statistics for a user.

    Args:
        user_id: User ID

    Returns:
        Dictionary with disk usage statistics
    """
    def get_dir_size(path: str) -> int:
        """Calculate total size of a directory."""
        total_size = 0
        try:
            for dirpath, dirnames, filenames in os.walk(path):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    try:
                        total_size += os.path.getsize(filepath)
                    except:
                        pass
        except:
            pass
        return total_size

    import folder_paths as _fp

    # New structure: all user data is under {user_directory}/{user_id}
    user_dir = os.path.join(_get_user_directory(), user_id)
    total_size = get_dir_size(user_dir)

    return {
        'total_size_bytes': total_size,
        'total_size_mb': round(total_size / (1024 * 1024), 2),
    }


def ensure_user_directories(user_id: str) -> dict:
    """
    Ensure all user directories exist.

    Args:
        user_id: User ID

    Returns:
        Dictionary with created directory paths
    """
    directories = {
        'output': get_user_output_directory(user_id),
        'data': get_user_data_directory(user_id),
        'temp': get_user_temp_directory(user_id),
        'cache': get_user_cache_directory(user_id),
        'images': get_user_images_directory(user_id),
        'workflows': get_user_workflows_directory(user_id),
        'prompts': get_user_prompts_directory(user_id),
        'subgraphs': os.path.join(get_user_data_directory(user_id), "subgraphs"),
    }

    # Create subgraphs directory
    os.makedirs(directories['subgraphs'], exist_ok=True)

    # Create empty comfy.templates.json if not exists
    templates_file = os.path.join(get_user_data_directory(user_id), "comfy.templates.json")
    if not os.path.exists(templates_file):
        with open(templates_file, 'w') as f:
            f.write('[]')

    logger.info(f"Ensured all directories for user {user_id}")
    return directories


def migrate_file_to_user(
    source_path: str,
    user_id: str,
    target_subdir: str = "images"
) -> str:
    """
    Migrate a file to a user's directory.

    Args:
        source_path: Source file path
        user_id: Target user ID
        target_subdir: Target subdirectory (images, temp, cache, etc.)

    Returns:
        Path to migrated file

    Raises:
        FileNotFoundError: If source file doesn't exist
        ValueError: If target_subdir is invalid
    """
    import shutil

    if not os.path.exists(source_path):
        raise FileNotFoundError(f"Source file not found: {source_path}")

    # Get target directory based on subdir
    if target_subdir == "images":
        target_dir = get_user_images_directory(user_id)
    elif target_subdir == "temp":
        target_dir = get_user_temp_directory(user_id)
    elif target_subdir == "cache":
        target_dir = get_user_cache_directory(user_id)
    elif target_subdir == "workflows":
        target_dir = get_user_workflows_directory(user_id)
    elif target_subdir == "prompts":
        target_dir = get_user_prompts_directory(user_id)
    else:
        raise ValueError(f"Invalid target subdirectory: {target_subdir}")

    # Get filename
    filename = os.path.basename(source_path)
    target_path = os.path.join(target_dir, filename)

    # Handle duplicate filenames
    if os.path.exists(target_path):
        base, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(target_path):
            filename = f"{base}_{counter}{ext}"
            target_path = os.path.join(target_dir, filename)
            counter += 1

    # Copy file
    shutil.copy2(source_path, target_path)

    logger.info(f"Migrated file from {source_path} to {target_path}")
    return target_path


def get_user_disk_usage_summary(user_ids: list = None) -> dict:
    """
    Get disk usage summary for multiple users.

    Args:
        user_ids: List of user IDs (if None, get all users)

    Returns:
        Dictionary with summary statistics
    """
    import folder_paths as _fp

    if user_ids is None:
        # Get all user directories from user_directory
        user_base = _get_user_directory()

        user_ids = set()

        # Scan user directory for user subdirectories
        if os.path.exists(user_base):
            for name in os.listdir(user_base):
                # Skip system users and non-directory entries
                if name.startswith("__"):
                    continue
                if os.path.isdir(os.path.join(user_base, name)):
                    user_ids.add(name)

    # Calculate usage for each user
    usage_data = []
    total_size = 0

    for user_id in user_ids:
        try:
            usage = get_user_disk_usage(user_id)
            usage_data.append({
                'user_id': user_id,
                **usage
            })
            total_size += usage['total_size_bytes']
        except Exception as e:
            logger.warning(f"Failed to get disk usage for user {user_id}: {e}")

    # Sort by total size descending
    usage_data.sort(key=lambda x: x['total_size_bytes'], reverse=True)

    return {
        'users': usage_data,
        'total_users': len(usage_data),
        'total_size_bytes': total_size,
        'total_size_mb': round(total_size / (1024 * 1024), 2),
        'total_size_gb': round(total_size / (1024 * 1024 * 1024), 2),
    }
