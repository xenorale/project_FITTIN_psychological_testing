"""invites and answers tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-17

"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "invites",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("token", sa.String, nullable=False, unique=True),
        sa.Column("candidate_id", sa.Integer, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=True),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("used_at", sa.DateTime, nullable=True),
        sa.Column("started_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_invites_token", "invites", ["token"])

    op.create_table(
        "answers",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("candidate_id", sa.Integer, sa.ForeignKey("candidates.id"), nullable=False),
        sa.Column("statement_id", sa.Integer, nullable=False),
        sa.Column("value", sa.Boolean, nullable=False),
    )


def downgrade():
    op.drop_table("answers")
    op.drop_index("ix_invites_token", table_name="invites")
    op.drop_table("invites")
