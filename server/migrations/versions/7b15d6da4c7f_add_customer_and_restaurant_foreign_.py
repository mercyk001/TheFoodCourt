"""add customer and restaurant foreign keys to orders

Revision ID: 7b15d6da4c7f
Revises: 21e293977a75
Create Date: 2025-07-24 08:26:54.907575

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7b15d6da4c7f'
down_revision = '21e293977a75'
branch_labels = None
depends_on = None


def upgrade():
    # Add customer_id column as nullable first
    op.add_column('orders', sa.Column('customer_id', sa.Integer(), nullable=True))
    
    # Add restaurant_id column as nullable first
    op.add_column('orders', sa.Column('restaurant_id', sa.Integer(), nullable=True))
    
    # Add foreign key constraints
    op.create_foreign_key('fk_orders_customer_id', 'orders', 'customers', ['customer_id'], ['id'])
    op.create_foreign_key('fk_orders_restaurant_id', 'orders', 'restaurants', ['restaurant_id'], ['id'])


def downgrade():
    # Drop foreign key constraints
    op.drop_constraint('fk_orders_restaurant_id', 'orders', type_='foreignkey')
    op.drop_constraint('fk_orders_customer_id', 'orders', type_='foreignkey')
    
    # Drop columns
    op.drop_column('orders', 'restaurant_id')
    op.drop_column('orders', 'customer_id')
