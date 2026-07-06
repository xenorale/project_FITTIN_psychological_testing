"""initial tables

Revision ID: 0001
Revises:
Create Date: 2026-06-15

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "hr_users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String, nullable=False, unique=True),
        sa.Column("password_hash", sa.String, nullable=False),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )

    op.create_table(
        "candidates",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("email", sa.String, nullable=False),
        sa.Column("position", sa.String, nullable=False),
        sa.Column("gender", sa.String, nullable=False),
        sa.Column("status", sa.String, nullable=False, server_default="invited"),
        sa.Column("invited_at", sa.DateTime, nullable=True),
        sa.Column("completed_at", sa.DateTime, nullable=True),
        sa.Column("duration_min", sa.Integer, nullable=True),
    )


def downgrade():
    op.drop_table("candidates")
    op.drop_table("hr_users")
