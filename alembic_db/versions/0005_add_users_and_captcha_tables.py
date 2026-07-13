"""
Add users and captcha_sessions tables for login system.

Revision ID: 0005_add_users_and_captcha_tables
Revises: 0004_user_data_isolation
Create Date: 2026-07-08
"""

from alembic import op
import sqlalchemy as sa

from app.database.models import NAMING_CONVENTION

revision = "0005_add_users_and_captcha_tables"
down_revision = "0004_user_data_isolation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update users table structure (add missing columns)
    # Check if columns exist before adding
    try:
        op.add_column('users', sa.Column('level', sa.Integer(), nullable=False, server_default="1"))
    except Exception:
        pass  # Column might already exist
    
    try:
        op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default="1"))
    except Exception:
        pass
    
    try:
        op.add_column('users', sa.Column('updated_at', sa.DateTime(timezone=False), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")))
    except Exception:
        pass
    
    try:
        op.add_column('users', sa.Column('login_fail_count', sa.Integer(), nullable=False, server_default="0"))
    except Exception:
        pass
    
    try:
        op.add_column('users', sa.Column('locked_until', sa.DateTime(timezone=False), nullable=True))
    except Exception:
        pass
    
    # Create indexes for users table
    try:
        op.create_index("ix_users_is_active", "users", ["is_active"])
    except Exception:
        pass
    
    try:
        op.create_index("ix_users_level", "users", ["level"])
    except Exception:
        pass

    # Create captcha_sessions table
    op.create_table(
        "captcha_sessions",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("captcha_text", sa.String(length=10), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("is_used", sa.Boolean(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_captcha_sessions_expires_at", "captcha_sessions", ["expires_at"])
    op.create_index("ix_captcha_sessions_is_used", "captcha_sessions", ["is_used"])


def downgrade() -> None:
    # Drop captcha_sessions table
    op.drop_index("ix_captcha_sessions_is_used", table_name="captcha_sessions")
    op.drop_index("ix_captcha_sessions_expires_at", table_name="captcha_sessions")
    op.drop_table("captcha_sessions")

    # Drop added columns from users table
    try:
        op.drop_index("ix_users_level", table_name="users")
    except Exception:
        pass
    
    try:
        op.drop_index("ix_users_is_active", table_name="users")
    except Exception:
        pass
    
    try:
        op.drop_column('users', 'locked_until')
    except Exception:
        pass
    
    try:
        op.drop_column('users', 'login_fail_count')
    except Exception:
        pass
    
    try:
        op.drop_column('users', 'updated_at')
    except Exception:
        pass
    
    try:
        op.drop_column('users', 'is_active')
    except Exception:
        pass
    
    try:
        op.drop_column('users', 'level')
    except Exception:
        pass
