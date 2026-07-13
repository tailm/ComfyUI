"""
Add user_configs table for user-level configuration storage.

Revision ID: 0006_user_config_isolation
Revises: 0005_add_users_and_captcha_tables
Create Date: 2026-07-09
"""

from alembic import op
import sqlalchemy as sa

from app.database.models import NAMING_CONVENTION

revision = "0006_user_config_isolation"
down_revision = "0005_add_users_and_captcha_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create user_configs table for user-level configuration storage
    op.create_table(
        "user_configs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=128), nullable=False),
        sa.Column("config_key", sa.String(length=512), nullable=False),
        sa.Column("config_value", sa.Text(), nullable=False),
        sa.Column("config_type", sa.String(length=32), nullable=False, server_default="string"),
        sa.Column("is_encrypted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=False), nullable=False),
        sa.UniqueConstraint("user_id", "config_key", name="uq_user_configs_user_id_config_key"),
    )
    
    # Create indexes for user_configs table
    op.create_index("ix_user_configs_user_id", "user_configs", ["user_id"])
    op.create_index("ix_user_configs_config_key", "user_configs", ["config_key"])
    op.create_index("ix_user_configs_user_key", "user_configs", ["user_id", "config_key"])
    op.create_index("ix_user_configs_updated_at", "user_configs", ["updated_at"])


def downgrade() -> None:
    # Drop indexes
    op.drop_index("ix_user_configs_updated_at", table_name="user_configs")
    op.drop_index("ix_user_configs_user_key", table_name="user_configs")
    op.drop_index("ix_user_configs_config_key", table_name="user_configs")
    op.drop_index("ix_user_configs_user_id", table_name="user_configs")
    
    # Drop unique constraint
    op.drop_constraint("uq_user_configs_user_id_config_key", table_name="user_configs")
    
    # Drop table
    op.drop_table("user_configs")
