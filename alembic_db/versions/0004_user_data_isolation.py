"""
Add user data isolation tables: workflows, prompts, node_io.
Optimize indexes for user isolation.

Revision ID: 0004_user_data_isolation
Revises: 0003_add_metadata_job_id
Create Date: 2026-07-08
"""

from alembic import op
import sqlalchemy as sa

from app.database.models import NAMING_CONVENTION

revision = "0004_user_data_isolation"
down_revision = "0003_add_metadata_job_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create workflows table for user-level workflow storage
    op.create_table(
        "workflows",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=128), nullable=False),
        sa.Column("name", sa.String(length=512), nullable=False),
        sa.Column("workflow_json", sa.JSON(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_template", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("last_used_at", sa.DateTime(timezone=False), nullable=True),
        sa.UniqueConstraint("user_id", "name", name="uq_workflows_user_name"),
    )
    op.create_index("ix_workflows_user_id", "workflows", ["user_id"])
    op.create_index("ix_workflows_name", "workflows", ["name"])
    op.create_index("ix_workflows_is_template", "workflows", ["is_template"])
    op.create_index("ix_workflows_created_at", "workflows", ["created_at"])
    op.create_index("ix_workflows_updated_at", "workflows", ["updated_at"])
    op.create_index("ix_workflows_user_updated", "workflows", ["user_id", "updated_at"])

    # Create prompts table for user-level prompt storage
    op.create_table(
        "prompts",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=128), nullable=False),
        sa.Column("workflow_id", sa.String(length=36), sa.ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True),
        sa.Column("prompt_json", sa.JSON(), nullable=False),
        sa.Column("execution_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("last_execution_at", sa.DateTime(timezone=False), nullable=True),
    )
    op.create_index("ix_prompts_user_id", "prompts", ["user_id"])
    op.create_index("ix_prompts_workflow_id", "prompts", ["workflow_id"])
    op.create_index("ix_prompts_created_at", "prompts", ["created_at"])
    op.create_index("ix_prompts_last_execution_at", "prompts", ["last_execution_at"])
    op.create_index("ix_prompts_user_created", "prompts", ["user_id", "created_at"])

    # Create node_io table for node input/output tracking
    op.create_table(
        "node_io",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=128), nullable=False),
        sa.Column("prompt_id", sa.String(length=36), nullable=False),
        sa.Column("node_id", sa.String(length=256), nullable=False),
        sa.Column("input_data", sa.JSON(), nullable=True),
        sa.Column("output_data", sa.JSON(), nullable=True),
        sa.Column("execution_time_ms", sa.BigInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Index("ix_node_io_user_prompt", "user_id", "prompt_id"),
    )
    op.create_index("ix_node_io_user_id", "node_io", ["user_id"])
    op.create_index("ix_node_io_prompt_id", "node_io", ["prompt_id"])
    op.create_index("ix_node_io_node_id", "node_io", ["node_id"])
    op.create_index("ix_node_io_created_at", "node_io", ["created_at"])

    # Optimize existing history table indexes
    # Create composite index for user_id + created_at for better query performance
    try:
        op.create_index("ix_history_user_created", "history", ["user_id", "created_at"])
    except Exception:
        # Index might already exist, ignore
        pass

    # Optimize asset_references table indexes
    # Create composite index for owner_id + created_at
    try:
        op.create_index("ix_asset_references_owner_created", "asset_references", ["owner_id", "created_at"])
    except Exception:
        # Index might already exist, ignore
        pass


def downgrade() -> None:
    # Drop node_io table
    op.drop_index("ix_node_io_created_at", table_name="node_io")
    op.drop_index("ix_node_io_node_id", table_name="node_io")
    op.drop_index("ix_node_io_prompt_id", table_name="node_io")
    op.drop_index("ix_node_io_user_id", table_name="node_io")
    op.drop_index("ix_node_io_user_prompt", table_name="node_io")
    op.drop_table("node_io")

    # Drop prompts table
    op.drop_index("ix_prompts_user_created", table_name="prompts")
    op.drop_index("ix_prompts_last_execution_at", table_name="prompts")
    op.drop_index("ix_prompts_created_at", table_name="prompts")
    op.drop_index("ix_prompts_workflow_id", table_name="prompts")
    op.drop_index("ix_prompts_user_id", table_name="prompts")
    op.drop_table("prompts")

    # Drop workflows table
    op.drop_index("ix_workflows_user_updated", table_name="workflows")
    op.drop_index("ix_workflows_updated_at", table_name="workflows")
    op.drop_index("ix_workflows_created_at", table_name="workflows")
    op.drop_index("ix_workflows_is_template", table_name="workflows")
    op.drop_index("ix_workflows_name", table_name="workflows")
    op.drop_index("ix_workflows_user_id", table_name="workflows")
    op.drop_constraint("uq_workflows_user_name", table_name="workflows")
    op.drop_table("workflows")

    # Drop optimized indexes
    try:
        op.drop_index("ix_history_user_created", table_name="history")
    except Exception:
        pass

    try:
        op.drop_index("ix_asset_references_owner_created", table_name="asset_references")
    except Exception:
        pass
