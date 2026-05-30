"""Auth and demo tables migration

Revision ID: 002
Revises: 001
Create Date: 2026-05-29
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("wechat_openid", sa.String(128), nullable=True))
    op.add_column("users", sa.Column("avatar_url", sa.String(512), nullable=True))
    op.add_column("users", sa.Column("community_site_id", sa.String(64), nullable=True))
    op.create_index("ix_users_wechat_openid", "users", ["wechat_openid"], unique=True)

    op.create_table(
        "medicine_plans",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("elder_id", sa.String(64), sa.ForeignKey("elders.id"), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("dose", sa.String(64), nullable=False),
        sa.Column("schedule", sa.String(64), nullable=False),
        sa.Column("status", sa.String(16), server_default="pending"),
    )
    op.create_table(
        "care_tasks",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("elder_id", sa.String(64), sa.ForeignKey("elders.id"), nullable=False),
        sa.Column("icon", sa.String(8), server_default="📋"),
        sa.Column("title", sa.String(128), nullable=False),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("status", sa.String(16), server_default="pending"),
        sa.Column("due_label", sa.String(64), server_default=""),
    )
    op.create_table(
        "notification_rules",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.String(64), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("key", sa.String(32), nullable=False),
        sa.Column("label", sa.String(64), nullable=False),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("enabled", sa.Boolean(), server_default="true"),
    )
    op.create_table(
        "companion_states",
        sa.Column("elder_id", sa.String(64), sa.ForeignKey("elders.id"), primary_key=True),
        sa.Column("mood", sa.String(32), server_default="平稳"),
        sa.Column("companion_score", sa.Integer(), server_default="78"),
        sa.Column("speak_hint", sa.Text(), server_default="今天记得多喝水"),
    )
    op.create_table(
        "community_activities",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("site_id", sa.String(64), sa.ForeignKey("community_sites.id")),
        sa.Column("title", sa.String(128), nullable=False),
        sa.Column("time_label", sa.String(64), nullable=False),
        sa.Column("location", sa.String(128), nullable=False),
        sa.Column("enrolled", sa.Integer(), server_default="0"),
        sa.Column("pending_check_in", sa.Integer(), server_default="0"),
        sa.Column("status_label", sa.String(32), server_default="报名中"),
        sa.Column("status_tone", sa.String(16), server_default="normal"),
    )


def downgrade() -> None:
    op.drop_table("community_activities")
    op.drop_table("companion_states")
    op.drop_table("notification_rules")
    op.drop_table("care_tasks")
    op.drop_table("medicine_plans")
    op.drop_index("ix_users_wechat_openid", table_name="users")
    op.drop_column("users", "community_site_id")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "wechat_openid")
