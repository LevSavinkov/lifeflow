"""add cards due_at (goal lifetime end)

Revision ID: d7c3b2a190fe
Revises: b21f8d3e9a0c
Create Date: 2026-04-03

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d7c3b2a190fe"
down_revision: Union[str, Sequence[str], None] = "b21f8d3e9a0c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "cards",
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("cards", "due_at")
