"""Add performance indexes for user authentication system.

Revision ID: 0005_add_user_auth_indexes
Revises: 0004_add_user_auth_tables
Create Date: 2026-06-09

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0005_add_user_auth_indexes'
down_revision = '0004_add_user_auth_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add composite index for user sessions query optimization
    op.create_index(
        'ix_user_sessions_user_id_expires_at_is_active',
        'user_sessions',
        ['user_id', 'expires_at', 'is_active']
    )
    
    # Add index for user sessions cleanup query
    op.create_index(
        'ix_user_sessions_expires_at_is_active',
        'user_sessions',
        ['expires_at', 'is_active']
    )
    
    # Add index for user templates search optimization
    op.create_index(
        'ix_user_templates_user_id_is_public_created_at',
        'user_templates',
        ['user_id', 'is_public', 'created_at']
    )
    
    # Add index for user templates category search
    op.create_index(
        'ix_user_templates_category_is_public_created_at',
        'user_templates',
        ['category', 'is_public', 'created_at']
    )
    
    # Add index for user templates popularity (view_count + use_count)
    op.create_index(
        'ix_user_templates_is_public_view_count_use_count',
        'user_templates',
        ['is_public', 'view_count', 'use_count']
    )
    
    # Add index for user list queries
    op.create_index(
        'ix_users_is_active_is_admin_created_at',
        'users',
        ['is_active', 'is_admin', 'created_at']
    )
    
    # Add index for user search optimization
    op.create_index(
        'ix_users_username_email_display_name',
        'users',
        ['username', 'email', 'display_name']
    )
    
    # Add index for user sessions last_used_at for cleanup
    op.create_index(
        'ix_user_sessions_last_used_at',
        'user_sessions',
        ['last_used_at']
    )
    
    # Add index for user templates updated_at for sorting
    op.create_index(
        'ix_user_templates_updated_at',
        'user_templates',
        ['updated_at']
    )
    
    # Add index for user templates tags for search
    op.create_index(
        'ix_user_templates_tags',
        'user_templates',
        ['tags']
    )
    
    # Add index for user preferences user_id (already primary key, but add for consistency)
    op.create_index(
        'ix_user_preferences_user_id',
        'user_preferences',
        ['user_id']
    )


def downgrade() -> None:
    # Drop all indexes added in this migration
    op.drop_index('ix_user_sessions_user_id_expires_at_is_active', table_name='user_sessions')
    op.drop_index('ix_user_sessions_expires_at_is_active', table_name='user_sessions')
    op.drop_index('ix_user_templates_user_id_is_public_created_at', table_name='user_templates')
    op.drop_index('ix_user_templates_category_is_public_created_at', table_name='user_templates')
    op.drop_index('ix_user_templates_is_public_view_count_use_count', table_name='user_templates')
    op.drop_index('ix_users_is_active_is_admin_created_at', table_name='users')
    op.drop_index('ix_users_username_email_display_name', table_name='users')
    op.drop_index('ix_user_sessions_last_used_at', table_name='user_sessions')
    op.drop_index('ix_user_templates_updated_at', table_name='user_templates')
    op.drop_index('ix_user_templates_tags', table_name='user_templates')
    op.drop_index('ix_user_preferences_user_id', table_name='user_preferences')