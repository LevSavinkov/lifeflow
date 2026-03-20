"""drop done from cards

Revision ID: 4f6a7b0c1d2e
Revises: 9786d5759afb
Create Date: 2026-03-20 18:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4f6a7b0c1d2e"
down_revision: Union[str, Sequence[str], None] = "9786d5759afb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("cards", "done")


def downgrade() -> None:
    op.add_column("cards", sa.Column("done", sa.Boolean(), nullable=True))
