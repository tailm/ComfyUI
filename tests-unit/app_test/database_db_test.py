from pathlib import Path

from app.database import db as db_module


def test_get_db_path_returns_sqlite_file_path(tmp_path):
    db_path = tmp_path / "comfyui.db"
    db_module.args.database_url = f"sqlite:///{db_path}"

    assert db_module.get_db_path() == str(db_path)


def test_ensure_parent_directory_creates_missing_directories(tmp_path):
    db_path = tmp_path / "nested" / "db" / "comfyui.db"

    db_module._ensure_parent_directory(str(db_path))

    assert db_path.parent.exists()
