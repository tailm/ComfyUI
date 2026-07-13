"""
Workflow and Prompt Models

Defines ORM models for user-level workflow and prompt storage.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    BigInteger,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.assets.helpers import get_utc_now
from app.database.models import Base


class Workflow(Base):
    """
    User workflow storage model.
    
    Each workflow belongs to a specific user and can be:
    - A personal workflow (is_template=False)
    - A shared template (is_template=True)
    """
    
    __tablename__ = "workflows"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    workflow_json: Mapped[dict[str, Any]] = mapped_column(
        JSON(none_as_null=True), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_template: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=get_utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=get_utc_now
    )
    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False), nullable=True
    )
    
    # Relationships
    prompts: Mapped[list[Prompt]] = relationship(
        "Prompt",
        back_populates="workflow",
        cascade="all,delete-orphan",
        passive_deletes=True,
    )
    
    __table_args__ = (
        Index("ix_workflows_user_id", "user_id"),
        Index("ix_workflows_name", "name"),
        Index("ix_workflows_is_template", "is_template"),
        Index("ix_workflows_created_at", "created_at"),
        Index("ix_workflows_updated_at", "updated_at"),
        Index("ix_workflows_user_updated", "user_id", "updated_at"),
        # Unique constraint: user can only have one workflow with a given name
        # But templates can have same name across users
        # This is handled at the application layer
    )
    
    def __repr__(self) -> str:
        return f"<Workflow id={self.id} name={self.name!r} user={self.user_id}>"


class Prompt(Base):
    """
    User prompt storage model.
    
    Stores prompt execution data with optional workflow association.
    """
    
    __tablename__ = "prompts"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    workflow_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("workflows.id", ondelete="SET NULL"), nullable=True
    )
    prompt_json: Mapped[dict[str, Any]] = mapped_column(
        JSON(none_as_null=True), nullable=False
    )
    execution_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=get_utc_now
    )
    last_execution_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False), nullable=True
    )
    
    # Relationships
    workflow: Mapped[Workflow | None] = relationship(
        "Workflow",
        back_populates="prompts",
    )
    
    node_io_records: Mapped[list[NodeIO]] = relationship(
        "NodeIO",
        back_populates="prompt",
        cascade="all,delete-orphan",
        passive_deletes=True,
    )
    
    __table_args__ = (
        Index("ix_prompts_user_id", "user_id"),
        Index("ix_prompts_workflow_id", "workflow_id"),
        Index("ix_prompts_created_at", "created_at"),
        Index("ix_prompts_last_execution_at", "last_execution_at"),
        Index("ix_prompts_user_created", "user_id", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<Prompt id={self.id} user={self.user_id}>"


class NodeIO(Base):
    """
    Node input/output tracking model.
    
    Records the inputs and outputs of each node execution,
    associated with a specific prompt and user.
    """
    
    __tablename__ = "node_io"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(String(128), nullable=False)
    prompt_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("prompts.id", ondelete="CASCADE"), 
        nullable=False
    )
    node_id: Mapped[str] = mapped_column(String(256), nullable=False)
    input_data: Mapped[dict[str, Any] | None] = mapped_column(
        JSON(none_as_null=True), nullable=True
    )
    output_data: Mapped[dict[str, Any] | None] = mapped_column(
        JSON(none_as_null=True), nullable=True
    )
    execution_time_ms: Mapped[int | None] = mapped_column(
        BigInteger, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, default=get_utc_now
    )
    
    # Relationships
    prompt: Mapped[Prompt] = relationship(
        "Prompt",
        back_populates="node_io_records",
    )
    
    __table_args__ = (
        Index("ix_node_io_user_id", "user_id"),
        Index("ix_node_io_prompt_id", "prompt_id"),
        Index("ix_node_io_node_id", "node_id"),
        Index("ix_node_io_created_at", "created_at"),
        Index("ix_node_io_user_prompt", "user_id", "prompt_id"),
    )
    
    def __repr__(self) -> str:
        return f"<NodeIO id={self.id} node={self.node_id} prompt={self.prompt_id}>"
