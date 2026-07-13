#!/usr/bin/env python3
"""
User Data Migration Tool

This script migrates existing data to associate with user IDs for data isolation.
It handles:
1. History records without user_id
2. Asset references without owner_id
3. Provides validation and rollback capabilities
"""

import argparse
import json
import logging
import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    print("Warning: tqdm not installed, progress bars will be disabled")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class UserDataMigrator:
    """Migrates existing data to support user isolation."""

    def __init__(self, db_path: str, default_user_id: str = "0", dry_run: bool = False):
        self.db_path = db_path
        self.default_user_id = default_user_id
        self.dry_run = dry_run
        self.conn = None
        self.stats = {
            'history_migrated': 0,
            'assets_migrated': 0,
            'errors': 0
        }

    def connect(self):
        """Connect to the database."""
        if not os.path.exists(self.db_path):
            raise FileNotFoundError(f"Database not found: {self.db_path}")
        
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        logger.info(f"Connected to database: {self.db_path}")

    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def backup_database(self) -> str:
        """Create a backup of the database before migration."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{self.db_path}.backup_{timestamp}"
        
        if not self.dry_run:
            import shutil
            shutil.copy2(self.db_path, backup_path)
            logger.info(f"Database backed up to: {backup_path}")
        else:
            logger.info(f"[DRY RUN] Would backup database to: {backup_path}")
        
        return backup_path

    def migrate_history(self) -> int:
        """
        Migrate history records without user_id.
        Returns the number of records migrated.
        """
        cursor = self.conn.cursor()
        
        # Count records to migrate
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM history 
            WHERE user_id IS NULL OR user_id = ''
        """)
        count = cursor.fetchone()['count']
        
        if count == 0:
            logger.info("No history records need migration")
            return 0
        
        logger.info(f"Found {count} history records to migrate")
        
        if self.dry_run:
            logger.info(f"[DRY RUN] Would migrate {count} history records")
            return count
        
        # Migrate records with progress bar
        if HAS_TQDM:
            pbar = tqdm(total=count, desc="Migrating history")
        
        cursor.execute("""
            UPDATE history 
            SET user_id = ? 
            WHERE user_id IS NULL OR user_id = ''
        """, (self.default_user_id,))
        
        migrated = cursor.rowcount
        self.conn.commit()
        
        if HAS_TQDM:
            pbar.update(migrated)
            pbar.close()
        
        self.stats['history_migrated'] = migrated
        logger.info(f"Migrated {migrated} history records")
        
        return migrated

    def migrate_assets(self) -> int:
        """
        Migrate asset references without owner_id.
        Returns the number of records migrated.
        """
        cursor = self.conn.cursor()
        
        # Count records to migrate
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM asset_references 
            WHERE owner_id IS NULL OR owner_id = ''
        """)
        count = cursor.fetchone()['count']
        
        if count == 0:
            logger.info("No asset references need migration")
            return 0
        
        logger.info(f"Found {count} asset references to migrate")
        
        if self.dry_run:
            logger.info(f"[DRY RUN] Would migrate {count} asset references")
            return count
        
        # Migrate records with progress bar
        if HAS_TQDM:
            pbar = tqdm(total=count, desc="Migrating assets")
        
        cursor.execute("""
            UPDATE asset_references 
            SET owner_id = ? 
            WHERE owner_id IS NULL OR owner_id = ''
        """, (self.default_user_id,))
        
        migrated = cursor.rowcount
        self.conn.commit()
        
        if HAS_TQDM:
            pbar.update(migrated)
            pbar.close()
        
        self.stats['assets_migrated'] = migrated
        logger.info(f"Migrated {migrated} asset references")
        
        return migrated

    def validate_migration(self) -> dict:
        """
        Validate that all records have user_id/owner_id.
        Returns validation results.
        """
        cursor = self.conn.cursor()
        
        # Check history
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM history 
            WHERE user_id IS NULL OR user_id = ''
        """)
        history_without_user = cursor.fetchone()['count']
        
        # Check asset_references
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM asset_references 
            WHERE owner_id IS NULL OR owner_id = ''
        """)
        assets_without_owner = cursor.fetchone()['count']
        
        # Get total counts
        cursor.execute("SELECT COUNT(*) as count FROM history")
        total_history = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM asset_references")
        total_assets = cursor.fetchone()['count']
        
        validation = {
            'history_without_user': history_without_user,
            'assets_without_owner': assets_without_owner,
            'total_history': total_history,
            'total_assets': total_assets,
            'valid': (history_without_user == 0 and assets_without_owner == 0)
        }
        
        return validation

    def print_report(self):
        """Print migration report."""
        print("\n" + "="*60)
        print("MIGRATION REPORT")
        print("="*60)
        print(f"Database: {self.db_path}")
        print(f"Default User ID: {self.default_user_id}")
        print(f"Dry Run: {self.dry_run}")
        print("-"*60)
        print(f"History Records Migrated: {self.stats['history_migrated']}")
        print(f"Asset References Migrated: {self.stats['assets_migrated']}")
        print(f"Errors: {self.stats['errors']}")
        print("="*60 + "\n")

    def run(self, skip_backup: bool = False):
        """Run the full migration process."""
        try:
            # Connect to database
            self.connect()
            
            # Backup database
            if not skip_backup:
                backup_path = self.backup_database()
            
            # Run migrations
            logger.info("Starting data migration...")
            
            self.migrate_history()
            self.migrate_assets()
            
            # Validate migration
            validation = self.validate_migration()
            
            # Print report
            self.print_report()
            
            # Print validation results
            print("\nVALIDATION RESULTS")
            print("-"*60)
            print(f"Total History Records: {validation['total_history']}")
            print(f"History Without User ID: {validation['history_without_user']}")
            print(f"Total Asset References: {validation['total_assets']}")
            print(f"Assets Without Owner ID: {validation['assets_without_owner']}")
            print(f"Migration Valid: {'✓' if validation['valid'] else '✗'}")
            print("-"*60 + "\n")
            
            if not validation['valid']:
                logger.error("Migration validation failed!")
                return False
            
            logger.info("Migration completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            self.stats['errors'] += 1
            return False
        finally:
            self.close()


def main():
    parser = argparse.ArgumentParser(
        description="Migrate user data for data isolation"
    )
    parser.add_argument(
        "db_path",
        help="Path to the ComfyUI database file"
    )
    parser.add_argument(
        "--default-user",
        default="0",
        help="Default user ID to assign (default: '0')"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform a dry run without making changes"
    )
    parser.add_argument(
        "--skip-backup",
        action="store_true",
        help="Skip database backup (not recommended)"
    )
    
    args = parser.parse_args()
    
    # Run migration
    migrator = UserDataMigrator(
        db_path=args.db_path,
        default_user_id=args.default_user,
        dry_run=args.dry_run
    )
    
    success = migrator.run(skip_backup=args.skip_backup)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
