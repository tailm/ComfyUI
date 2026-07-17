"""
Storage Backend Abstraction Layer

Provides a unified interface for file operations that works with both
local filesystem and remote HTTP storage backends.
"""

import os
import logging
import asyncio
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional, Set
from urllib.parse import urljoin

logger = logging.getLogger(__name__)


@dataclass
class StorageConfig:
    """Storage configuration."""
    user_root: str
    is_remote: bool
    timeout: int = 30
    max_retries: int = 3
    retry_backoff: float = 1.0


class StorageBackend(ABC):
    """Abstract base class for storage backends."""

    @abstractmethod
    def get_user_path(self, user_id: str, dir_type: str) -> str:
        """Get user directory path.

        Args:
            user_id: User identifier
            dir_type: Directory type ('output', 'input', 'temp')

        Returns:
            Full path to the user directory
        """
        pass

    @abstractmethod
    def read_file(self, path: str) -> bytes:
        """Read file content.

        Args:
            path: File path

        Returns:
            File content as bytes
        """
        pass

    @abstractmethod
    def write_file(self, path: str, data: bytes) -> str:
        """Write file content.

        Args:
            path: File path
            data: File content

        Returns:
            Path to the written file
        """
        pass

    @abstractmethod
    def list_files(self, dir_path: str, extensions: Optional[Set[str]] = None) -> list:
        """List files in a directory.

        Args:
            dir_path: Directory path
            extensions: Optional set of file extensions to filter

        Returns:
            List of filenames
        """
        pass

    @abstractmethod
    def file_exists(self, path: str) -> bool:
        """Check if a file exists.

        Args:
            path: File path

        Returns:
            True if file exists
        """
        pass

    @abstractmethod
    def ensure_dir(self, path: str) -> None:
        """Ensure a directory exists.

        Args:
            path: Directory path
        """
        pass

    @abstractmethod
    def delete_file(self, path: str) -> bool:
        """Delete a file.

        Args:
            path: File path

        Returns:
            True if deletion succeeded
        """
        pass

    @abstractmethod
    def is_remote(self) -> bool:
        """Check if this is a remote storage backend.

        Returns:
            True if remote, False if local
        """
        pass


class LocalStorageBackend(StorageBackend):
    """Local filesystem storage backend."""

    def __init__(self, user_root: str):
        self.user_root = os.path.abspath(user_root)

    def get_user_path(self, user_id: str, dir_type: str) -> str:
        path = os.path.join(self.user_root, user_id, dir_type)
        return path

    def read_file(self, path: str) -> bytes:
        with open(path, 'rb') as f:
            return f.read()

    def write_file(self, path: str, data: bytes) -> str:
        parent = os.path.dirname(path)
        os.makedirs(parent, exist_ok=True)
        with open(path, 'wb') as f:
            f.write(data)
        return path

    def list_files(self, dir_path: str, extensions: Optional[Set[str]] = None) -> list:
        if not os.path.isdir(dir_path):
            return []
        files = [f for f in os.listdir(dir_path)
                 if os.path.isfile(os.path.join(dir_path, f))]
        if extensions:
            files = [f for f in files
                     if os.path.splitext(f)[1].lower() in extensions]
        return sorted(files)

    def file_exists(self, path: str) -> bool:
        return os.path.isfile(path)

    def ensure_dir(self, path: str) -> None:
        os.makedirs(path, exist_ok=True)

    def delete_file(self, path: str) -> bool:
        try:
            os.remove(path)
            return True
        except OSError:
            return False

    def is_remote(self) -> bool:
        return False


class RemoteStorageBackend(StorageBackend):
    """Remote HTTP storage backend.

    Communicates with a remote storage service via HTTP requests.
    Supports retry with exponential backoff and configurable timeout.
    """

    def __init__(self, user_root: str, config: Optional[StorageConfig] = None):
        if not user_root.startswith(('http://', 'https://')):
            raise ValueError(f"Remote storage URL must start with http:// or https://: {user_root}")
        # Ensure URL ends with /
        self.user_root = user_root.rstrip('/') + '/'
        self.config = config or StorageConfig(
            user_root=user_root,
            is_remote=True
        )
        self._session = None

    def _get_session(self):
        """Get or create aiohttp session (lazy initialization)."""
        if self._session is None:
            try:
                import aiohttp
                self._session = aiohttp.ClientSession(
                    timeout=aiohttp.ClientTimeout(total=self.config.timeout)
                )
            except ImportError:
                raise ImportError("aiohttp is required for remote storage backend. Install with: pip install aiohttp")
        return self._session

    def _build_url(self, *parts) -> str:
        """Build URL from base URL and path parts."""
        path = '/'.join(str(p).strip('/') for p in parts if p)
        return urljoin(self.user_root, path)

    async def _request_with_retry(self, method: str, url: str, **kwargs) -> 'aiohttp.ClientResponse':
        """Send HTTP request with retry and exponential backoff.

        Args:
            method: HTTP method
            url: Request URL
            **kwargs: Additional arguments for aiohttp request

        Returns:
            ClientResponse

        Raises:
            ConnectionError: After all retries exhausted
        """
        import aiohttp

        last_error = None
        for attempt in range(self.config.max_retries):
            try:
                session = self._get_session()
                async with session.request(method, url, **kwargs) as resp:
                    if resp.status < 400:
                        return await resp.read(), resp.status, dict(resp.headers)
                    elif resp.status == 404:
                        return None, resp.status, dict(resp.headers)
                    elif resp.status >= 500:
                        # Server error, retry
                        last_error = Exception(f"Server error {resp.status} for {url}")
                        await asyncio.sleep(self.config.retry_backoff * (2 ** attempt))
                        continue
                    else:
                        # Client error, don't retry
                        raise Exception(f"Client error {resp.status} for {url}: {await resp.text()}")
            except asyncio.TimeoutError:
                last_error = Exception(f"Timeout for {url} (attempt {attempt + 1})")
                logger.warning(last_error)
                await asyncio.sleep(self.config.retry_backoff * (2 ** attempt))
            except aiohttp.ClientError as e:
                last_error = Exception(f"Connection error for {url}: {e} (attempt {attempt + 1})")
                logger.warning(last_error)
                await asyncio.sleep(self.config.retry_backoff * (2 ** attempt))

        raise ConnectionError(f"All {self.config.max_retries} retries exhausted for {url}: {last_error}")

    def get_user_path(self, user_id: str, dir_type: str) -> str:
        return self._build_url(user_id, dir_type)

    def read_file(self, path: str) -> bytes:
        """Read file content (synchronous wrapper).

        For remote backend, this runs the async operation in an event loop.
        """
        return asyncio.get_event_loop().run_until_complete(self._read_file_async(path))

    async def _read_file_async(self, path: str) -> bytes:
        result, status, headers = await self._request_with_retry('GET', path)
        if result is None:
            raise FileNotFoundError(f"File not found: {path}")
        return result

    def write_file(self, path: str, data: bytes) -> str:
        """Write file content (synchronous wrapper)."""
        return asyncio.get_event_loop().run_until_complete(self._write_file_async(path, data))

    async def _write_file_async(self, path: str, data: bytes) -> str:
        result, status, headers = await self._request_with_retry('PUT', path, data=data)
        if status and status >= 400:
            raise IOError(f"Failed to write file {path}: HTTP {status}")
        return path

    def list_files(self, dir_path: str, extensions: Optional[Set[str]] = None) -> list:
        """List files in directory (synchronous wrapper)."""
        return asyncio.get_event_loop().run_until_complete(self._list_files_async(dir_path, extensions))

    async def _list_files_async(self, dir_path: str, extensions: Optional[Set[str]] = None) -> list:
        result, status, headers = await self._request_with_retry('GET', dir_path)
        if result is None:
            return []
        import json
        try:
            data = json.loads(result)
            files = data if isinstance(data, list) else data.get('files', [])
            if extensions:
                files = [f for f in files
                         if os.path.splitext(f)[1].lower() in extensions]
            return sorted(files)
        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON response from {dir_path}")
            return []

    def file_exists(self, path: str) -> bool:
        """Check if file exists (synchronous wrapper)."""
        return asyncio.get_event_loop().run_until_complete(self._file_exists_async(path))

    async def _file_exists_async(self, path: str) -> bool:
        try:
            result, status, headers = await self._request_with_retry('HEAD', path)
            return status is not None and status < 400
        except Exception:
            return False

    def ensure_dir(self, path: str) -> None:
        """Ensure directory exists (synchronous wrapper).

        For remote storage, this is typically a no-op as directories
        are created implicitly by the remote service.
        """
        pass

    def delete_file(self, path: str) -> bool:
        """Delete a file (synchronous wrapper)."""
        return asyncio.get_event_loop().run_until_complete(self._delete_file_async(path))

    async def _delete_file_async(self, path: str) -> bool:
        try:
            result, status, headers = await self._request_with_retry('DELETE', path)
            return status is not None and status < 400
        except Exception:
            return False

    def is_remote(self) -> bool:
        return True

    def __del__(self):
        """Clean up aiohttp session."""
        if self._session is not None:
            try:
                asyncio.get_event_loop().run_until_complete(self._session.close())
            except Exception:
                pass


class StorageBackendFactory:
    """Factory for creating storage backend instances."""

    _instance: Optional[StorageBackend] = None

    @classmethod
    def get_backend(cls) -> StorageBackend:
        """Get the current storage backend instance.

        Returns:
            StorageBackend instance (singleton)
        """
        if cls._instance is None:
            cls._instance = cls._create_backend()
        return cls._instance

    @classmethod
    def _create_backend(cls) -> StorageBackend:
        """Create a storage backend based on current configuration.

        Returns:
            LocalStorageBackend or RemoteStorageBackend
        """
        import folder_paths

        user_dir = folder_paths.get_user_directory()

        if user_dir.startswith(('http://', 'https://')):
            logger.info(f"Using remote storage backend: {user_dir}")
            config = StorageConfig(
                user_root=user_dir,
                is_remote=True
            )
            return RemoteStorageBackend(user_dir, config)
        else:
            logger.info(f"Using local storage backend: {user_dir}")
            return LocalStorageBackend(user_dir)

    @classmethod
    def reset(cls):
        """Reset the backend instance.

        Should be called when user_directory configuration changes.
        """
        if cls._instance is not None and isinstance(cls._instance, RemoteStorageBackend):
            # Clean up remote session
            del cls._instance
        cls._instance = None
