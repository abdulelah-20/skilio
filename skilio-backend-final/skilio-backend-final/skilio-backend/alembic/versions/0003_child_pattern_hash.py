"""Add the optional child symbol PIN hash.

Revision ID: 0003
Revises: 0002
"""

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("children", sa.Column("pattern_hash", sa.String(200), nullable=True))


def downgrade() -> None:
    op.drop_column("children", "pattern_hash")
