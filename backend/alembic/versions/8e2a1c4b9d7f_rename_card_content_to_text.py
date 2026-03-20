"""rename card content to text

Revision ID: 8e2a1c4b9d7f
Revises: 4f6a7b0c1d2e
Create Date: 2026-03-20 19:02:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "8e2a1c4b9d7f"
down_revision: Union[str, Sequence[str], None] = "4f6a7b0c1d2e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("cards", "content", new_column_name="text")


def downgrade() -> None:
    op.alter_column("cards", "text", new_column_name="content")
