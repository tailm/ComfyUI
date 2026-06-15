"""
Add user authentication and template management tables.

Revision ID: 0004_add_user_auth_tables
Revises: 0003_add_metadata_job_id
Create Date: 2026-06-09
"""

from alembic import op
import sqlalchemy as sa

from app.database.models import NAMING_CONVENTION

revision = "0004_add_user_auth_tables"
down_revision = "0003_add_metadata_job_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("username", sa.String(length=128), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("display_name", sa.String(length=255), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("salt", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column("is_admin", sa.Boolean(), nullable=False, default=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("username", name=op.f("uq_users_username")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
    )
    
    # Create indexes
    op.create_index("ix_users_username", "users", ["username"])
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_created_at", "users", ["created_at"])
    
    # Create user_sessions table
    op.create_table(
        "user_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("session_token", sa.String(length=255), nullable=False),
        sa.Column("refresh_token", sa.String(length=255), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("last_used_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_sessions")),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_user_sessions_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("session_token", name=op.f("uq_user_sessions_session_token")),
        sa.UniqueConstraint("refresh_token", name=op.f("uq_user_sessions_refresh_token")),
    )
    
    # Create indexes
    op.create_index("ix_user_sessions_session_token", "user_sessions", ["session_token"])
    op.create_index("ix_user_sessions_refresh_token", "user_sessions", ["refresh_token"])
    op.create_index("ix_user_sessions_expires_at", "user_sessions", ["expires_at"])
    op.create_index("ix_user_sessions_user_id_is_active", "user_sessions", ["user_id", "is_active"])
    
    # Create user_templates table
    op.create_table(
        "user_templates",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("workflow_data", sa.Text(), nullable=False),
        sa.Column("thumbnail", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("tags", sa.Text(), nullable=True),
        sa.Column("is_public", sa.Boolean(), nullable=False, default=False),
        sa.Column("is_favorite", sa.Boolean(), nullable=False, default=False),
        sa.Column("view_count", sa.Integer(), nullable=False, default=0),
        sa.Column("use_count", sa.Integer(), nullable=False, default=0),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_templates")),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_user_templates_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("user_id", "name", name=op.f("uq_user_templates_user_id_name")),
    )
    
    # Create indexes
    op.create_index("ix_user_templates_user_id", "user_templates", ["user_id"])
    op.create_index("ix_user_templates_name", "user_templates", ["name"])
    op.create_index("ix_user_templates_category", "user_templates", ["category"])
    op.create_index("ix_user_templates_is_public", "user_templates", ["is_public"])
    op.create_index("ix_user_templates_is_favorite", "user_templates", ["is_favorite"])
    op.create_index("ix_user_templates_created_at", "user_templates", ["created_at"])
    
    # Create user_preferences table
    op.create_table(
        "user_preferences",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("theme", sa.String(length=50), nullable=True, default="light"),
        sa.Column("language", sa.String(length=10), nullable=True, default="en"),
        sa.Column("auto_save", sa.Boolean(), nullable=False, default=True),
        sa.Column("auto_save_interval", sa.Integer(), nullable=False, default=30000),
        sa.Column("show_minimap", sa.Boolean(), nullable=False, default=False),
        sa.Column("show_grid", sa.Boolean(), nullable=False, default=True),
        sa.Column("snap_to_grid", sa.Boolean(), nullable=False, default=True),
        sa.Column("show_advanced_widgets", sa.Boolean(), nullable=False, default=False),
        sa.Column("show_node_titles", sa.Boolean(), nullable=False, default=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("user_id", name=op.f("pk_user_preferences")),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_user_preferences_user_id_users"),
            ondelete="CASCADE",
        ),
    )
    
    # Create default admin user (password: admin123)
    # Password hash generated with: pbkdf2_sha256$100000$salt$hash
    op.execute("""
        INSERT INTO users (id, username, email, display_name, password_hash, salt, is_active, is_admin, created_at, updated_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            'admin',
            'admin@comfyui.local',
            'Administrator',
            'c1c224b03cd9bc7b6a86d77f5dace40191766c485cd55dc48caf9ac873335d6f',
            'b5f5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5',
            1,
            1,
            datetime('now'),
            datetime('now')
        )
    """)
    
    # Create default user preferences for admin
    op.execute("""
        INSERT INTO user_preferences (user_id, theme, language, auto_save, auto_save_interval, show_minimap, show_grid, snap_to_grid, show_advanced_widgets, show_node_titles, created_at, updated_at)
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            'light',
            'en',
            1,
            30000,
            0,
            1,
            1,
            0,
            1,
            datetime('now'),
            datetime('now')
        )
    """)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table("user_preferences")
    op.drop_table("user_templates")
    op.drop_table("user_sessions")
    op.drop_table("users")