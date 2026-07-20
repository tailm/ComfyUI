import json
import os
import re
import uuid
import glob
import shutil
import logging
import tempfile
import hashlib
import secrets
import base64
from datetime import datetime, timedelta
from aiohttp import web
from urllib import parse
import folder_paths
from .app_settings import AppSettings
from typing import TypedDict, Dict, Any, Optional


class FileInfo(TypedDict):
    path: str
    size: int
    modified: int
    created: int


# Password utilities
def hash_password(password: str, salt: Optional[bytes] = None) -> Dict[str, str]:
    """Hash a password with salt using PBKDF2-HMAC-SHA256."""
    if salt is None:
        salt = secrets.token_bytes(16)
    
    # Use PBKDF2 with 100,000 iterations
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000,
        dklen=32
    )
    
    return {
        'hash': base64.b64encode(key).decode('utf-8'),
        'salt': base64.b64encode(salt).decode('utf-8'),
        'algorithm': 'pbkdf2_sha256',
        'iterations': 100000
    }


def verify_password(password: str, stored_hash: str, salt: str, algorithm: str = 'pbkdf2_sha256', iterations: int = 100000) -> bool:
    """Verify a password against stored hash."""
    if algorithm != 'pbkdf2_sha256':
        raise ValueError(f"Unsupported algorithm: {algorithm}")
    
    salt_bytes = base64.b64decode(salt)
    computed_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt_bytes,
        iterations,
        dklen=32
    )
    
    stored_hash_bytes = base64.b64decode(stored_hash)
    return secrets.compare_digest(computed_hash, stored_hash_bytes)


class UserInfo(TypedDict):
    """User information structure."""
    username: str
    password_hash: str
    password_salt: str
    algorithm: str
    iterations: int
    created_at: str
    last_login: Optional[str]


def get_file_info(path: str, relative_to: str) -> FileInfo:
    return {
        "path": os.path.relpath(path, relative_to).replace(os.sep, '/'),
        "size": os.path.getsize(path),
        "modified": int(os.path.getmtime(path) * 1000),
        "created": int(os.path.getctime(path) * 1000),
    }


class UserManager():
    def __init__(self):
        user_directory = folder_paths.get_user_directory()

        self.settings = AppSettings(self)
        if not os.path.exists(user_directory):
            os.makedirs(user_directory, exist_ok=True)

        # Always load users from database (multi-user mode is always enabled)
        self.users = self._load_users_from_db()
        if not self.users:
            # Fallback to users.json if database is empty
            if os.path.isfile(self.get_users_file()):
                with open(self.get_users_file()) as f:
                    users_data = json.load(f)
                    # Convert old format to new format if needed
                    self.users = self._migrate_users_format(users_data)
            else:
                self.users = {}

    def _migrate_users_format(self, users_data: Dict) -> Dict[str, Dict[str, Any]]:
        """Migrate old user format to new format with password support."""
        migrated = {}
        for user_id, user_info in users_data.items():
            if isinstance(user_info, str):
                # Old format: {"user_id": "username"}
                migrated[user_id] = {
                    "username": user_info,
                    "password_hash": "",  # No password in old format
                    "password_salt": "",
                    "algorithm": "none",
                    "iterations": 0,
                    "created_at": datetime.now().isoformat(),
                    "last_login": None
                }
            elif isinstance(user_info, dict):
                # Already in new format
                migrated[user_id] = user_info
        return migrated

    def get_users_file(self):
        return os.path.join(folder_paths.get_user_directory(), "users.json")
    
    def _load_users_from_db(self) -> Dict[str, Dict[str, Any]]:
        """Load users from database."""
        import sqlite3
        
        users = {}
        db_path = os.path.join(folder_paths.get_user_directory(), "comfyui.db")
        
        if not os.path.exists(db_path):
            return users
        
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Check if users table exists
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='users'
            """)
            
            if not cursor.fetchone():
                conn.close()
                return users
            
            # Load users
            cursor.execute('''
                SELECT user_id, username, password_hash, password_salt,
                       algorithm, iterations, created_at, last_login, is_admin
                FROM users
            ''')
            
            for row in cursor.fetchall():
                user_id = row[0]
                users[user_id] = {
                    "username": row[1],
                    "password_hash": row[2] or "",
                    "password_salt": row[3] or "",
                    "algorithm": row[4] or "none",
                    "iterations": row[5] or 0,
                    "created_at": row[6],
                    "last_login": row[7],
                    "is_admin": bool(row[8]) if row[8] else False
                }
            
            conn.close()
            logging.info(f"Loaded {len(users)} users from database")
            
        except Exception as e:
            logging.error(f"Failed to load users from database: {e}")
        
        return users

    def get_request_user_id(self, request):
        # Always require user_id - no default value allowed
        # Try header first, then cookie (for browser direct requests like <img src>)
        user = request.headers.get("comfy-user")
        if not user:
            user = request.cookies.get("comfy-user")
        if not user:
            raise KeyError("Authentication required: comfy-user header or cookie is missing")
        if not user.strip():
            raise KeyError("Authentication required: comfy-user value is empty")

        # Block System Users (use same error message to prevent probing)
        if user.startswith(folder_paths.SYSTEM_USER_PREFIX):
            raise KeyError("Unknown user: " + user)

        # Reload users from database only if cache is empty
        if not self.users:
            self.users = self._load_users_from_db()
        
        # Check if user exists in new format
        if user not in self.users:
            # Try to find by username (for backward compatibility)
            user_found = False
            for user_id, user_info in self.users.items():
                if isinstance(user_info, dict) and user_info.get("username") == user:
                    user = user_id
                    user_found = True
                    break
            
            if not user_found:
                raise KeyError("Unknown user: " + user)

        return user

    def get_request_user_filepath(self, request, file, type="userdata", create_dir=True):
        if type == "userdata":
            root_dir = folder_paths.get_user_directory()
        else:
            raise KeyError("Unknown filepath type:" + type)

        try:
            user = self.get_request_user_id(request)
        except KeyError as e:
            return web.Response(status=401, text=str(e))
        user_root = folder_paths.get_public_user_directory(user)
        if user_root is None:
            return None
        path = user_root

        # prevent leaving /{type}
        if os.path.commonpath((root_dir, user_root)) != root_dir:
            return None

        if file is not None:
            # Check if filename is url encoded
            if "%" in file:
                file = parse.unquote(file)

            # prevent leaving /{type}/{user}
            path = os.path.abspath(os.path.join(user_root, file))
            if os.path.commonpath((user_root, path)) != user_root:
                return None

        parent = os.path.split(path)[0]

        if create_dir and not os.path.exists(parent):
            os.makedirs(parent, exist_ok=True)

        return path

    def add_user(self, name, password: Optional[str] = None):
        """Add a new user with optional password."""
        name = name.strip()
        if not name:
            raise ValueError("username not provided")
        if name.startswith(folder_paths.SYSTEM_USER_PREFIX):
            raise ValueError("System User prefix not allowed")
        
        # Check for duplicate username
        for user_info in self.users.values():
            if isinstance(user_info, dict) and user_info.get("username") == name:
                raise ValueError(f"Username '{name}' already exists")
        
        # Generate numeric user ID
        # Find the highest numeric user ID
        max_id = 0
        for existing_id in self.users.keys():
            if existing_id.isdigit():
                max_id = max(max_id, int(existing_id))
            elif existing_id == "default":
                continue  # Skip default user
        
        # New user ID is max_id + 1
        user_id = str(max_id + 1)

        # Create user info
        user_info = {
            "username": name,
            "created_at": datetime.now().isoformat(),
            "last_login": None
        }
        
        # Add password if provided
        if password:
            if len(password) < 6:
                raise ValueError("Password must be at least 6 characters")
            hashed = hash_password(password)
            user_info.update({
                "password_hash": hashed["hash"],
                "password_salt": hashed["salt"],
                "algorithm": hashed["algorithm"],
                "iterations": hashed["iterations"]
            })
        else:
            # No password - for backward compatibility
            user_info.update({
                "password_hash": "",
                "password_salt": "",
                "algorithm": "none",
                "iterations": 0
            })

        self.users[user_id] = user_info

        with open(self.get_users_file(), "w") as f:
            json.dump(self.users, f, indent=2)

        return user_id
    
    def authenticate_user(self, username: str, password: str) -> Optional[str]:
        """Authenticate user and return user_id if successful."""
        for user_id, user_info in self.users.items():
            if isinstance(user_info, dict) and user_info.get("username") == username:
                # Check if user has password
                if not user_info.get("password_hash"):
                    # User without password (legacy user)
                    return None
                
                # Verify password
                if verify_password(
                    password,
                    user_info["password_hash"],
                    user_info["password_salt"],
                    user_info.get("algorithm", "pbkdf2_sha256"),
                    user_info.get("iterations", 100000)
                ):
                    # Update last login
                    user_info["last_login"] = datetime.now().isoformat()
                    with open(self.get_users_file(), "w") as f:
                        json.dump(self.users, f, indent=2)
                    return user_id
        return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user info by username."""
        for user_id, user_info in self.users.items():
            if isinstance(user_info, dict) and user_info.get("username") == username:
                return {"user_id": user_id, **user_info}
        return None

    def add_routes(self, routes):
        self.settings.add_routes(routes)

        @routes.get("/users")
        async def get_users(request):
            # Return multi-user mode info without exposing user list
            # Only return the current authenticated user's info
            try:
                user_id = self.get_request_user_id(request)
            except KeyError:
                return web.json_response({
                    "storage": "server",
                    "users": []
                })
            user_info = self.users.get(user_id)
            if isinstance(user_info, dict):
                username = user_info.get("username", "")
            else:
                username = user_info if user_info else ""

            user_data = {"userId": user_id, "username": username}

            # Get full user info from database
            try:
                from app.database.db import create_session
                from app.database.user_models import User as UserModel
                with create_session() as session:
                    from sqlalchemy import select
                    stmt = select(UserModel).where(UserModel.id == user_id)
                    result = session.execute(stmt)
                    user_obj = result.scalar_one_or_none()
                    if user_obj:
                        user_data.update({
                            "level": user_obj.level,
                            "isAdmin": bool(user_obj.is_admin),
                            "isActive": user_obj.is_active,
                            "createdAt": user_obj.created_at.isoformat() if user_obj.created_at else None,
                            "lastLogin": user_obj.last_login.isoformat() if user_obj.last_login else None,
                        })
            except Exception:
                pass

            return web.json_response({
                "storage": "server",
                "users": [user_data]
            })

        @routes.post("/users")
        async def post_users(request):
            body = await request.json()
            username = body.get("username")
            password = body.get("password")
            
            if not username:
                return web.json_response({"error": "Username is required."}, status=400)
            
            # Check for duplicate username
            for user_info in self.users.values():
                if isinstance(user_info, dict) and user_info.get("username") == username:
                    return web.json_response({"error": f"Username '{username}' already exists."}, status=400)

            try:
                user_id = self.add_user(username, password)
                return web.json_response({
                    "user_id": user_id,
                    "username": username,
                    "has_password": bool(password)
                })
            except ValueError as e:
                return web.json_response({"error": str(e)}, status=400)
        
        @routes.post("/login")
        async def login(request):
            """Authenticate user with username and password."""
            try:
                body = await request.json()
                username = body.get("username")
                password = body.get("password")
                
                if not username or not password:
                    return web.json_response({"error": "Username and password are required."}, status=400)
                
                user_id = self.authenticate_user(username, password)
                if user_id:
                    return web.json_response({
                        "success": True,
                        "user_id": user_id,
                        "username": username,
                        "message": "Authentication successful"
                    })
                else:
                    return web.json_response({
                        "success": False,
                        "error": "Invalid username or password"
                    }, status=401)
                    
            except json.JSONDecodeError:
                return web.json_response({"error": "Invalid JSON payload."}, status=400)
            except Exception as e:
                logging.exception("Login error")
                return web.json_response({"error": "Internal server error."}, status=500)

        @routes.get("/userdata")
        async def listuserdata(request):
            """
            List user data files in a specified directory.

            This endpoint allows listing files in a user's data directory, with options for recursion,
            full file information, and path splitting.

            Query Parameters:
            - dir (required): The directory to list files from.
            - recurse (optional): If "true", recursively list files in subdirectories.
            - full_info (optional): If "true", return detailed file information (path, size, modified time).
            - split (optional): If "true", split file paths into components (only applies when full_info is false).

            Returns:
            - 400: If 'dir' parameter is missing.
            - 403: If the requested path is not allowed.
            - 404: If the requested directory does not exist.
            - 200: JSON response with the list of files or file information.

            The response format depends on the query parameters:
            - Default: List of relative file paths.
            - full_info=true: List of dictionaries with file details.
            - split=true (and full_info=false): List of lists, each containing path components.
            """
            directory = request.rel_url.query.get('dir', '')
            if not directory:
                return web.Response(status=400, text="Directory not provided")

            path = self.get_request_user_filepath(request, directory)
            if isinstance(path, web.Response):
                return path
            if not path:
                return web.Response(status=403, text="Invalid directory")

            if not os.path.exists(path):
                return web.Response(status=404, text="Directory not found")

            recurse = request.rel_url.query.get('recurse', '').lower() == "true"
            full_info = request.rel_url.query.get('full_info', '').lower() == "true"
            split_path = request.rel_url.query.get('split', '').lower() == "true"

            # Use different patterns based on whether we're recursing or not
            if recurse:
                pattern = os.path.join(glob.escape(path), '**', '*')
            else:
                pattern = os.path.join(glob.escape(path), '*')

            def process_full_path(full_path: str) -> FileInfo | str | list[str]:
                if full_info:
                    return get_file_info(full_path, path)

                rel_path = os.path.relpath(full_path, path).replace(os.sep, '/')
                if split_path:
                    return [rel_path] + rel_path.split('/')

                return rel_path

            results = [
                process_full_path(full_path)
                for full_path in glob.glob(pattern, recursive=recurse)
                if os.path.isfile(full_path)
            ]

            return web.json_response(results)

        @routes.get("/v2/userdata")
        async def list_userdata_v2(request):
            """
            List files and directories in a user's data directory.

            This endpoint provides a structured listing of contents within a specified
            subdirectory of the user's data storage.

            Query Parameters:
            - path (optional): The relative path within the user's data directory
                               to list. Defaults to the root ('').

            Returns:
            - 400: If the requested path is invalid, outside the user's data directory, or is not a directory.
            - 404: If the requested path does not exist.
            - 403: If the user is invalid.
            - 500: If there is an error reading the directory contents.
            - 200: JSON response containing a list of file and directory objects.
                   Each object includes:
                   - name: The name of the file or directory.
                   - type: 'file' or 'directory'.
                   - path: The relative path from the user's data root.
                   - size (for files): The size in bytes.
                   - modified (for files): The last modified timestamp (Unix epoch).
            """
            requested_rel_path = request.rel_url.query.get('path', '')

            # URL-decode the path parameter
            try:
                requested_rel_path = parse.unquote(requested_rel_path)
            except Exception as e:
                logging.warning(f"Failed to decode path parameter: {requested_rel_path}, Error: {e}")
                return web.Response(status=400, text="Invalid characters in path parameter")


            # Check user validity and get the absolute path for the requested directory
            base_user_path = self.get_request_user_filepath(request, None, create_dir=False)
            if isinstance(base_user_path, web.Response):
                return base_user_path

            if requested_rel_path:
                target_abs_path = self.get_request_user_filepath(request, requested_rel_path, create_dir=False)
                if isinstance(target_abs_path, web.Response):
                    return target_abs_path
            else:
                target_abs_path = base_user_path


            if not target_abs_path:
                 # Path traversal or other issue detected by get_request_user_filepath
                 return web.Response(status=400, text="Invalid path requested")

            # Handle cases where the user directory or target path doesn't exist
            if not os.path.exists(target_abs_path):
                # Check if it's the base user directory that's missing (new user case)
                if target_abs_path == base_user_path:
                    # It's okay if the base user directory doesn't exist yet, return empty list
                     return web.json_response([])
                else:
                    # A specific subdirectory was requested but doesn't exist
                     return web.Response(status=404, text="Requested path not found")

            if not os.path.isdir(target_abs_path):
                 return web.Response(status=400, text="Requested path is not a directory")

            results = []
            try:
                for root, dirs, files in os.walk(target_abs_path, topdown=True):
                    # Process directories
                    for dir_name in dirs:
                        dir_path = os.path.join(root, dir_name)
                        rel_path = os.path.relpath(dir_path, base_user_path).replace(os.sep, '/')
                        results.append({
                            "name": dir_name,
                            "path": rel_path,
                            "type": "directory"
                        })

                    # Process files
                    for file_name in files:
                        file_path = os.path.join(root, file_name)
                        rel_path = os.path.relpath(file_path, base_user_path).replace(os.sep, '/')
                        entry_info = {
                            "name": file_name,
                            "path": rel_path,
                            "type": "file"
                        }
                        try:
                            stats = os.stat(file_path) # Use os.stat for potentially better performance with os.walk
                            entry_info["size"] = stats.st_size
                            entry_info["modified"] = stats.st_mtime
                        except OSError as stat_error:
                            logging.warning(f"Could not stat file {file_path}: {stat_error}")
                            pass # Include file with available info
                        results.append(entry_info)
            except OSError as e:
                logging.error(f"Error listing directory {target_abs_path}: {e}")
                return web.Response(status=500, text="Error reading directory contents")

            # Sort results alphabetically, directories first then files
            results.sort(key=lambda x: (x['type'] != 'directory', x['name'].lower()))

            return web.json_response(results)

        def get_user_data_path(request, check_exists = False, param = "file"):
            file = request.match_info.get(param, None)
            if not file:
                return web.Response(status=400)

            path = self.get_request_user_filepath(request, file)
            if isinstance(path, web.Response):
                return path
            if not path:
                return web.Response(status=403)

            if check_exists and not os.path.exists(path):
                return web.Response(status=404)

            return path

        @routes.get("/userdata/{file}")
        async def getuserdata(request):
            path = get_user_data_path(request, check_exists=True)
            if not isinstance(path, str):
                return path

            return web.FileResponse(path)

        @routes.post("/userdata/{file}")
        async def post_userdata(request):
            """
            Upload or update a user data file.

            This endpoint handles file uploads to a user's data directory, with options for
            controlling overwrite behavior and response format.

            Query Parameters:
            - overwrite (optional): If "false", prevents overwriting existing files. Defaults to "true".
            - full_info (optional): If "true", returns detailed file information (path, size, modified time).
                                  If "false", returns only the relative file path.

            Path Parameters:
            - file: The target file path (URL encoded if necessary).

            Returns:
            - 400: If 'file' parameter is missing.
            - 403: If the requested path is not allowed.
            - 409: If overwrite=false and the file already exists.
            - 200: JSON response with either:
                  - Full file information (if full_info=true)
                  - Relative file path (if full_info=false)

            The request body should contain the raw file content to be written.
            """
            path = get_user_data_path(request)
            if not isinstance(path, str):
                return path

            overwrite = request.query.get("overwrite", 'true') != "false"
            full_info = request.query.get('full_info', 'false').lower() == "true"

            if not overwrite and os.path.exists(path):
                return web.Response(status=409, text="File already exists")

            try:
                body = await request.read()

                dir_name = os.path.dirname(path)
                fd, tmp_path = tempfile.mkstemp(dir=dir_name)
                try:
                    with os.fdopen(fd, "wb") as f:
                        f.write(body)
                    os.replace(tmp_path, path)
                except:
                    os.unlink(tmp_path)
                    raise
            except OSError as e:
                logging.warning(f"Error saving file '{path}': {e}")
                return web.Response(
                    status=400,
                    reason="Invalid filename. Please avoid special characters like :\\/*?\"<>|"
                )

            user_path = self.get_request_user_filepath(request, None)
            if isinstance(user_path, web.Response):
                return user_path
            if full_info:
                resp = get_file_info(path, user_path)
            else:
                resp = os.path.relpath(path, user_path)

            return web.json_response(resp)

        @routes.delete("/userdata/{file}")
        async def delete_userdata(request):
            path = get_user_data_path(request, check_exists=True)
            if not isinstance(path, str):
                return path

            os.remove(path)

            return web.Response(status=204)

        @routes.post("/userdata/{file}/move/{dest}")
        async def move_userdata(request):
            """
            Move or rename a user data file.

            This endpoint handles moving or renaming files within a user's data directory, with options for
            controlling overwrite behavior and response format.

            Path Parameters:
            - file: The source file path (URL encoded if necessary)
            - dest: The destination file path (URL encoded if necessary)

            Query Parameters:
            - overwrite (optional): If "false", prevents overwriting existing files. Defaults to "true".
            - full_info (optional): If "true", returns detailed file information (path, size, modified time).
                                  If "false", returns only the relative file path.

            Returns:
            - 400: If either 'file' or 'dest' parameter is missing
            - 403: If either requested path is not allowed
            - 404: If the source file does not exist
            - 409: If overwrite=false and the destination file already exists
            - 200: JSON response with either:
                  - Full file information (if full_info=true)
                  - Relative file path (if full_info=false)
            """
            source = get_user_data_path(request, check_exists=True)
            if not isinstance(source, str):
                return source

            dest = get_user_data_path(request, check_exists=False, param="dest")
            if not isinstance(dest, str):
                return dest

            overwrite = request.query.get("overwrite", 'true') != "false"
            full_info = request.query.get('full_info', 'false').lower() == "true"

            if not overwrite and os.path.exists(dest):
                return web.Response(status=409, text="File already exists")

            logging.info(f"moving '{source}' -> '{dest}'")
            shutil.move(source, dest)

            user_path = self.get_request_user_filepath(request, None)
            if isinstance(user_path, web.Response):
                return user_path
            if full_info:
                resp = get_file_info(dest, user_path)
            else:
                resp = os.path.relpath(dest, user_path)

            return web.json_response(resp)
