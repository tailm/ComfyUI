import logging
import os
from pathlib import Path
from logging.handlers import RotatingFileHandler

from config import settings


def setup_logger():
    logger = logging.getLogger("points_service")
    logger.setLevel(getattr(logging, settings.logging.level))

    formatter = logging.Formatter(settings.logging.format)

    # 控制台Handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 文件Handler
    log_dir = Path(settings.logging.file).parent
    os.makedirs(log_dir, exist_ok=True)

    file_handler = RotatingFileHandler(
        settings.logging.file,
        maxBytes=settings.logging.max_bytes,
        backupCount=settings.logging.backup_count,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger


logger = setup_logger()
