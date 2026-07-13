#!/usr/bin/env python3
"""
Migration Rollback Script

Provides rollback capability for the user data isolation migration.
"""

import argparse
import logging
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MigrationRollback:
    """Handles rollback of user data isolation migration."""

    def __init__(self, db_path: str, backup_path: str = None):
        self.db_path = db_path
        self.backup_path = backup_path
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    def find_latest_backup(self) -> str:
        """Find the most recent database backup."""
        db_dir = os.path.dirname(self.db_path)
        db_name = os.path.basename(self.db_path)
        
        # Look for backup files
        backups = []
        for filename in os.listdir(db_dir):
            if filename.startswith(db_name) and 'backup' in filename:
                filepath = os.path.join(db_dir, filename)
                backups.append((filepath, os.path.getmtime(filepath)))
        
        if not backups:
            raise FileNotFoundError("No backup files found")
        
        # Sort by modification time (most recent first)
        backups.sort(key=lambda x: x[1], reverse=True)
        return backups[0][0]

    def create_pre_rollback_backup(self) -> str:
        """Create a backup before rollback."""
        backup_path = f"{self.db_path}.pre_rollback_{self.timestamp}"
        shutil.copy2(self.db_path, backup_path)
        logger.info(f"Created pre-rollback backup: {backup_path}")
        return backup_path

    def restore_database(self, backup_path: str) -> bool:
        """Restore database from backup."""
        try:
            # Verify backup exists
            if not os.path.exists(backup_path):
                raise FileNotFoundError(f"Backup not found: {backup_path}")
            
            # Create pre-rollback backup
            self.create_pre_rollback_backup()
            
            # Restore database
            shutil.copy2(backup_path, self.db_path)
            logger.info(f"Restored database from: {backup_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to restore database: {e}")
            return False

    def rollback_alembic(self) -> bool:
        """Rollback Alembic migration."""
        try:
            # Run alembic downgrade
            result = subprocess.run(
                ['alembic', 'downgrade', '-1'],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                logger.info("Alembic rollback successful")
                logger.info(result.stdout)
                return True
            else:
                logger.error("Alembic rollback failed")
                logger.error(result.stderr)
                return False
                
        except Exception as e:
            logger.error(f"Alembic rollback error: {e}")
            return False

    def verify_rollback(self) -> bool:
        """Verify that rollback was successful."""
        import sqlite3
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check that new tables don't exist
            new_tables = ['workflows', 'prompts', 'node_io']
            
            for table in new_tables:
                cursor.execute(f"""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name=?
                """, (table,))
                
                if cursor.fetchone():
                    logger.warning(f"Table '{table}' still exists")
                    return False
            
            logger.info("Rollback verification passed")
            return True
            
        except Exception as e:
            logger.error(f"Verification error: {e}")
            return False
        finally:
            conn.close()

    def run_rollback(self, skip_alembic: bool = False) -> bool:
        """Execute the rollback process."""
        try:
            logger.info("Starting rollback process...")
            
            # Step 1: Find or use provided backup
            if self.backup_path:
                backup = self.backup_path
            else:
                backup = self.find_latest_backup()
            
            logger.info(f"Using backup: {backup}")
            
            # Step 2: Restore database
            if not self.restore_database(backup):
                return False
            
            # Step 3: Rollback Alembic (optional)
            if not skip_alembic:
                if not self.rollback_alembic():
                    logger.warning(
                        "Alembic rollback failed, but database was restored. "
                        "Manual intervention may be required."
                    )
            
            # Step 4: Verify rollback
            if not self.verify_rollback():
                logger.error("Rollback verification failed")
                return False
            
            logger.info("Rollback completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(
        description="Rollback user data isolation migration"
    )
    parser.add_argument(
        "db_path",
        help="Path to the ComfyUI database file"
    )
    parser.add_argument(
        "--backup",
        help="Path to specific backup file to restore"
    )
    parser.add_argument(
        "--skip-alembic",
        action="store_true",
        help="Skip Alembic rollback (only restore database)"
    )
    parser.add_argument(
        "--list-backups",
        action="store_true",
        help="List available backups and exit"
    )
    
    args = parser.parse_args()
    
    # List backups if requested
    if args.list_backups:
        db_dir = os.path.dirname(args.db_path)
        db_name = os.path.basename(args.db_path)
        
        print(f"\nAvailable backups for {db_name}:")
        print("-" * 70)
        
        found = False
        for filename in sorted(os.listdir(db_dir)):
            if filename.startswith(db_name) and 'backup' in filename:
                filepath = os.path.join(db_dir, filename)
                mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
                size = os.path.getsize(filepath) / (1024 * 1024)
                print(f"{filename:<50} {mtime}  {size:.2f}MB")
                found = True
        
        if not found:
            print("No backups found")
        
        print()
        sys.exit(0)
    
    # Run rollback
    rollback = MigrationRollback(
        db_path=args.db_path,
        backup_path=args.backup
    )
    
    success = rollback.run_rollback(skip_alembic=args.skip_alembic)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
