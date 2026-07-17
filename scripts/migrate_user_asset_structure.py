#!/usr/bin/env python3
"""
Migrate user asset directory structure from old to new format.

Old structure:
  output/user_{user_id}/  ->  user/{user_id}/output/
  input/user_{user_id}/   ->  user/{user_id}/input/
  temp/user_{user_id}/    ->  user/{user_id}/temp/

Usage:
  python scripts/migrate_user_asset_structure.py --dry-run     # Preview migration
  python scripts/migrate_user_asset_structure.py --execute     # Execute migration
  python scripts/migrate_user_asset_structure.py --rollback    # Rollback last migration
"""

import os
import sys
import json
import shutil
import logging
import argparse
from datetime import datetime
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Migration log file for rollback support
MIGRATION_LOG_FILE = "migration_log.json"

# Directory type mappings: (old_base, old_prefix_pattern, new_subdir)
MIGRATION_MAPPINGS = [
    ("output", "user_", "output"),
    ("input", "user_", "input"),
    ("temp", "user_", "temp"),
]


def find_legacy_users(base_path: str) -> dict:
    """Find all users with legacy directory structure.

    Args:
        base_path: Project base path

    Returns:
        Dict mapping user_id to list of (old_dir, new_subdir) tuples
    """
    users = {}

    for old_base, prefix, new_subdir in MIGRATION_MAPPINGS:
        old_dir = os.path.join(base_path, old_base)
        if not os.path.isdir(old_dir):
            continue

        for name in os.listdir(old_dir):
            if not name.startswith(prefix):
                continue

            item_path = os.path.join(old_dir, name)
            if not os.path.isdir(item_path):
                continue

            # Extract user_id from "user_{id}" pattern
            user_id = name[len(prefix):]
            if not user_id:
                continue

            if user_id not in users:
                users[user_id] = []

            users[user_id].append((item_path, new_subdir))

    return users


def calculate_dir_size(path: str) -> int:
    """Calculate total size of a directory in bytes."""
    total = 0
    try:
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                try:
                    total += os.path.getsize(fp)
                except OSError:
                    pass
    except OSError:
        pass
    return total


def count_files(path: str) -> int:
    """Count total number of files in a directory."""
    count = 0
    try:
        for dirpath, dirnames, filenames in os.walk(path):
            count += len(filenames)
    except OSError:
        pass
    return count


def check_disk_space(base_path: str, required_bytes: int) -> bool:
    """Check if there's enough disk space for migration.

    Args:
        base_path: Path to check disk space on
        required_bytes: Required bytes

    Returns:
        True if enough space available
    """
    try:
        usage = shutil.disk_usage(base_path)
        if usage.free < required_bytes:
            logger.error(
                f"Insufficient disk space: {usage.free / (1024**3):.2f} GB available, "
                f"{required_bytes / (1024**3):.2f} GB required"
            )
            return False
        return True
    except OSError as e:
        logger.warning(f"Could not check disk space: {e}")
        return True  # Proceed if we can't check


def generate_migration_plan(base_path: str, user_dir: str) -> dict:
    """Generate a migration plan.

    Args:
        base_path: Project base path
        user_dir: User root directory path

    Returns:
        Migration plan dict
    """
    users = find_legacy_users(base_path)

    plan = {
        'base_path': base_path,
        'user_dir': user_dir,
        'users': {},
        'total_files': 0,
        'total_size_bytes': 0,
    }

    for user_id, dirs in users.items():
        user_plan = {
            'migrations': [],
            'file_count': 0,
            'size_bytes': 0,
        }

        for old_dir, new_subdir in dirs:
            new_dir = os.path.join(user_dir, user_id, new_subdir)
            file_count = count_files(old_dir)
            size = calculate_dir_size(old_dir)

            user_plan['migrations'].append({
                'source': old_dir,
                'destination': new_dir,
                'subdir_type': new_subdir,
                'file_count': file_count,
                'size_bytes': size,
            })
            user_plan['file_count'] += file_count
            user_plan['size_bytes'] += size

        plan['users'][user_id] = user_plan
        plan['total_files'] += user_plan['file_count']
        plan['total_size_bytes'] += user_plan['size_bytes']

    return plan


def execute_migration(base_path: str, user_dir: str, dry_run: bool = False) -> dict:
    """Execute the migration.

    Args:
        base_path: Project base path
        user_dir: User root directory path
        dry_run: If True, only show what would be done

    Returns:
        Migration result dict
    """
    plan = generate_migration_plan(base_path, user_dir)

    if not plan['users']:
        logger.info("No legacy directories found. Nothing to migrate.")
        return plan

    # Check disk space
    if not dry_run and not check_disk_space(base_path, plan['total_size_bytes']):
        return plan

    result = {
        'plan': plan,
        'dry_run': dry_run,
        'migrated_files': [],
        'skipped_files': [],
        'failed_files': [],
        'timestamp': datetime.now().isoformat(),
    }

    for user_id, user_plan in plan['users'].items():
        logger.info(f"Processing user: {user_id}")

        for migration in user_plan['migrations']:
            src = migration['source']
            dst = migration['destination']

            if not os.path.exists(src):
                logger.warning(f"  Source does not exist: {src}")
                continue

            if dry_run:
                logger.info(f"  [DRY RUN] Would migrate: {src} -> {dst}")
                continue

            # Create destination directory
            os.makedirs(dst, exist_ok=True)

            # Move files
            try:
                for item in os.listdir(src):
                    src_item = os.path.join(src, item)
                    dst_item = os.path.join(dst, item)

                    if os.path.exists(dst_item):
                        logger.warning(f"  Skipping {item} (already exists at destination)")
                        result['skipped_files'].append({
                            'source': src_item,
                            'destination': dst_item,
                            'reason': 'already_exists',
                        })
                        continue

                    try:
                        shutil.move(src_item, dst_item)
                        result['migrated_files'].append({
                            'source': src_item,
                            'destination': dst_item,
                        })
                        logger.info(f"  Moved: {item}")
                    except Exception as e:
                        logger.error(f"  Failed to move {item}: {e}")
                        result['failed_files'].append({
                            'source': src_item,
                            'destination': dst_item,
                            'error': str(e),
                        })
            except Exception as e:
                logger.error(f"  Error processing {src}: {e}")

            # Try to remove old directory if empty
            try:
                os.rmdir(src)
                logger.info(f"  Removed empty directory: {src}")
            except OSError:
                logger.warning(f"  Directory not empty, keeping: {src}")

    # Save migration log for rollback
    if not dry_run and result['migrated_files']:
        save_migration_log(result)

    return result


def save_migration_log(result: dict) -> None:
    """Save migration log for rollback support."""
    log_path = MIGRATION_LOG_FILE
    try:
        with open(log_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        logger.info(f"Migration log saved to: {log_path}")
    except Exception as e:
        logger.error(f"Failed to save migration log: {e}")


def rollback_migration(base_path: str, user_dir: str) -> dict:
    """Rollback the last migration.

    Args:
        base_path: Project base path
        user_dir: User root directory path

    Returns:
        Rollback result dict
    """
    log_path = MIGRATION_LOG_FILE

    if not os.path.exists(log_path):
        logger.error("No migration log found. Cannot rollback.")
        return {'success': False, 'error': 'No migration log found'}

    try:
        with open(log_path, 'r', encoding='utf-8') as f:
            migration_log = json.load(f)
    except Exception as e:
        logger.error(f"Failed to read migration log: {e}")
        return {'success': False, 'error': str(e)}

    result = {
        'success': True,
        'rolled_back': [],
        'failed': [],
    }

    # Reverse the migration: move files back from new to old locations
    migrated_files = migration_log.get('migrated_files', [])
    # Process in reverse order
    for entry in reversed(migrated_files):
        src = entry['destination']  # Current location (new structure)
        dst = entry['source']       # Original location (old structure)

        if not os.path.exists(src):
            logger.warning(f"  Source not found for rollback: {src}")
            continue

        # Ensure destination parent directory exists
        dst_parent = os.path.dirname(dst)
        os.makedirs(dst_parent, exist_ok=True)

        try:
            shutil.move(src, dst)
            result['rolled_back'].append({
                'from': src,
                'to': dst,
            })
            logger.info(f"  Rolled back: {os.path.basename(src)}")
        except Exception as e:
            logger.error(f"  Failed to rollback {src}: {e}")
            result['failed'].append({
                'from': src,
                'to': dst,
                'error': str(e),
            })

    # Clean up empty new directories
    for user_id in migration_log.get('plan', {}).get('users', {}):
        for subdir in ['output', 'input', 'temp']:
            new_dir = os.path.join(user_dir, user_id, subdir)
            try:
                if os.path.isdir(new_dir) and not os.listdir(new_dir):
                    os.rmdir(new_dir)
            except OSError:
                pass

    # Remove migration log after successful rollback
    if not result['failed']:
        try:
            os.remove(log_path)
            logger.info("Migration log removed after successful rollback")
        except OSError:
            pass

    return result


def print_migration_report(plan: dict, result: dict = None) -> None:
    """Print a formatted migration report."""
    print("\n" + "=" * 60)
    print("User Asset Directory Migration Report")
    print("=" * 60)

    if result and result.get('dry_run'):
        print("Mode: DRY RUN (preview only)")

    print(f"\nBase path: {plan['base_path']}")
    print(f"User directory: {plan['user_dir']}")
    print(f"Users found: {len(plan['users'])}")
    print(f"Total files: {plan['total_files']}")
    print(f"Total size: {plan['total_size_bytes'] / (1024**2):.2f} MB")

    if plan['users']:
        print("\nUser Details:")
        print("-" * 60)
        for user_id, user_plan in plan['users'].items():
            print(f"  User: {user_id}")
            print(f"    Files: {user_plan['file_count']}")
            print(f"    Size: {user_plan['size_bytes'] / (1024**2):.2f} MB")
            for migration in user_plan['migrations']:
                print(f"    {migration['subdir_type']}: {migration['source']} -> {migration['destination']}")

    if result:
        if result.get('migrated_files'):
            print(f"\nMigrated: {len(result['migrated_files'])} files")
        if result.get('skipped_files'):
            print(f"Skipped: {len(result['skipped_files'])} files")
        if result.get('failed_files'):
            print(f"Failed: {len(result['failed_files'])} files")
            for entry in result['failed_files']:
                print(f"  - {entry['source']}: {entry['error']}")

    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description='Migrate user asset directory structure from old to new format'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview migration without making changes'
    )
    parser.add_argument(
        '--execute',
        action='store_true',
        help='Execute the migration'
    )
    parser.add_argument(
        '--rollback',
        action='store_true',
        help='Rollback the last migration'
    )
    parser.add_argument(
        '--base-path',
        type=str,
        default=None,
        help='Project base path (default: auto-detect)'
    )
    parser.add_argument(
        '--user-dir',
        type=str,
        default=None,
        help='User root directory (default: {base_path}/user)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output report file path (JSON format)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show verbose output'
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Determine base path
    if args.base_path:
        base_path = os.path.abspath(args.base_path)
    else:
        # Auto-detect: go up from scripts/ directory
        base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    # Determine user directory
    if args.user_dir:
        user_dir = os.path.abspath(args.user_dir)
    else:
        user_dir = os.path.join(base_path, "user")

    if not args.dry_run and not args.execute and not args.rollback:
        # Default: dry-run
        args.dry_run = True

    if args.rollback:
        logger.info("Starting rollback...")
        result = rollback_migration(base_path, user_dir)
        if result['success']:
            print(f"\nRollback completed. Rolled back {len(result['rolled_back'])} files.")
            if result['failed']:
                print(f"Failed to rollback {len(result['failed'])} files.")
        else:
            print(f"\nRollback failed: {result.get('error', 'Unknown error')}")
        return

    if args.dry_run:
        logger.info("Running migration in DRY RUN mode...")
        plan = generate_migration_plan(base_path, user_dir)
        print_migration_report(plan)
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(plan, f, indent=2, ensure_ascii=False)
            logger.info(f"Report saved to: {args.output}")
        return

    if args.execute:
        logger.info("Executing migration...")
        result = execute_migration(base_path, user_dir, dry_run=False)
        print_migration_report(result['plan'], result)

        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            logger.info(f"Report saved to: {args.output}")

        if result['failed_files']:
            sys.exit(1)


if __name__ == '__main__':
    main()
