#!/usr/bin/env python3
"""
Migrate files from old directory structure to new structure.

Old structure: output/{user_id}/
New structure: output/user_{user_id}/
"""

import os
import shutil
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def migrate_output_directory():
    """Migrate output directory structure."""
    output_dir = "output"
    
    if not os.path.exists(output_dir):
        logger.info("Output directory does not exist")
        return
    
    # Find all numeric directories (old structure)
    for item in os.listdir(output_dir):
        item_path = os.path.join(output_dir, item)
        
        # Skip if not a directory or already in new format
        if not os.path.isdir(item_path):
            continue
        
        # Check if it's a numeric user ID (old format)
        if item.isdigit():
            new_dir = os.path.join(output_dir, f"user_{item}")
            
            logger.info(f"Migrating {item_path} -> {new_dir}")
            
            # Create new directory if it doesn't exist
            os.makedirs(new_dir, exist_ok=True)
            
            # Move all contents
            for sub_item in os.listdir(item_path):
                src = os.path.join(item_path, sub_item)
                dst = os.path.join(new_dir, sub_item)
                
                # Skip if destination already exists
                if os.path.exists(dst):
                    logger.warning(f"  Skipping {sub_item} (already exists in destination)")
                    continue
                
                # Move file or directory
                shutil.move(src, dst)
                logger.info(f"  Moved {sub_item}")
            
            # Remove old directory if empty
            try:
                os.rmdir(item_path)
                logger.info(f"  Removed empty directory {item_path}")
            except OSError:
                logger.warning(f"  Directory {item_path} not empty, keeping it")
        
        # Check if it's already in new format (user_{id})
        elif item.startswith("user_"):
            logger.info(f"Directory {item_path} already in new format, skipping")
    
    logger.info("Migration completed!")

if __name__ == "__main__":
    migrate_output_directory()
