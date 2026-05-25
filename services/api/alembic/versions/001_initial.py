"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-24
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("phone", sa.String(32), nullable=False, unique=True),
        sa.Column("name", sa.String(64), nullable=False),
        sa.Column("role", sa.String(16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "community_sites",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("duty_staff", sa.String(64), nullable=False),
        sa.Column("device_online_rate", sa.Integer(), server_default="96"),
        sa.Column("service_status_label", sa.String(64), server_default="服务响应正常"),
    )
    op.create_table(
        "elders",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(64), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("location_label", sa.String(128), nullable=False),
        sa.Column("address", sa.String(256), server_default=""),
        sa.Column("community_site_id", sa.String(64), sa.ForeignKey("community_sites.id")),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id")),
    )
    op.create_table(
        "elder_bindings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("elder_id", sa.String(64), sa.ForeignKey("elders.id"), nullable=False),
        sa.Column("family_user_id", sa.String(64), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("relation", sa.String(32), nullable=False),
        sa.Column("is_primary", sa.Boolean(), server_default="false"),
    )
    op.create_table(
        "devices",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("elder_id", sa.String(64), sa.ForeignKey("elders.id"), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("location", sa.String(128), nullable=False),
        sa.Column("online", sa.Boolean(), server_default="true"),
        sa.Column("battery_percent", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(32), server_default="normal"),
    )
    op.create_table(
        "alert_events",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("elder_id", sa.String(64), sa.ForeignKey("elders.id"), nullable=False),
        sa.Column("alert_type", sa.String(32), nullable=False),
        sa.Column("level", sa.String(16), nullable=False),
        sa.Column("icon", sa.String(8), server_default="⚠"),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("detail", sa.Text(), server_default=""),
        sa.Column("status", sa.String(16), server_default="pending"),
        sa.Column("status_label", sa.String(32), server_default="待确认"),
        sa.Column("tag", sa.String(32), server_default="需关注"),
        sa.Column("tag_tone", sa.String(16), server_default="warm"),
        sa.Column("timeline", sa.JSON(), server_default="[]"),
        sa.Column("suggestion", sa.Text(), server_default=""),
        sa.Column("alert_code", sa.String(32), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "work_orders",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("code", sa.String(32), nullable=False, unique=True),
        sa.Column("elder_id", sa.String(64), sa.ForeignKey("elders.id")),
        sa.Column("alert_id", sa.String(64), sa.ForeignKey("alert_events.id")),
        sa.Column("tab", sa.String(16), nullable=False),
        sa.Column("icon", sa.String(8), server_default="▤"),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("tag", sa.String(32), nullable=False),
        sa.Column("tag_tone", sa.String(16), server_default="normal"),
        sa.Column("status", sa.String(16), server_default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_table(
        "health_snapshots",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("elder_id", sa.String(64), sa.ForeignKey("elders.id"), nullable=False),
        sa.Column("metric_key", sa.String(32), nullable=False),
        sa.Column("label", sa.String(64), nullable=False),
        sa.Column("value", sa.String(64), nullable=False),
        sa.Column("unit", sa.String(32), server_default=""),
        sa.Column("status", sa.String(16), server_default="normal"),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )


def downgrade() -> None:
    op.drop_table("health_snapshots")
    op.drop_table("work_orders")
    op.drop_table("alert_events")
    op.drop_table("devices")
    op.drop_table("elder_bindings")
    op.drop_table("elders")
    op.drop_table("community_sites")
    op.drop_table("users")
