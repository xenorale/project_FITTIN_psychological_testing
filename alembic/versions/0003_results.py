"""results table

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-20

"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "results",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("candidate_id", sa.Integer, sa.ForeignKey("candidates.id"), nullable=False, unique=True),
        sa.Column("raw", sa.JSON, nullable=False),
        sa.Column("profile", sa.JSON, nullable=False),
        sa.Column("validity", sa.String, nullable=False),
        sa.Column("computed_at", sa.DateTime, nullable=True),
    )


def downgrade():
    op.drop_table("results")
