"""add_smart_dining_models

Revision ID: 48ad9672e689
Revises: 92a16077d9e3
Create Date: 2026-07-31 18:50:10.633027

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '48ad9672e689'
down_revision = '92a16077d9e3'
branch_labels = None
depends_on = None


def upgrade():
    # Create meal_types ENUM (only once, with checkfirst)
    meal_types_enum = postgresql.ENUM(
        'breakfast',
        'lunch',
        'snacks',
        'dinner',
        name='meal_types',
        create_type=False
    )
    meal_types_enum.create(op.get_bind(), checkfirst=True)
    
    # Create meal_menus table
    # Use postgresql.ENUM with create_type=False to avoid duplicate creation
    op.create_table('meal_menus',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meal_type', postgresql.ENUM('breakfast', 'lunch', 'snacks', 'dinner', name='meal_types', create_type=False), nullable=False),
        sa.Column('meal_date', sa.Date(), nullable=False),
        sa.Column('menu_items', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('calories', sa.Integer(), nullable=True),
        sa.Column('attendance_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('food_waste_kg', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('meal_type', 'meal_date', name='unique_meal_per_day')
    )
    op.create_index(op.f('ix_meal_menus_meal_date'), 'meal_menus', ['meal_date'], unique=False)
    
    # Create meal_feedbacks table
    op.create_table('meal_feedbacks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meal_menu_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('feedback_text', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='valid_rating'),
        sa.ForeignKeyConstraint(['meal_menu_id'], ['meal_menus.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('meal_menu_id', 'user_id', name='unique_feedback_per_user_per_meal')
    )
    op.create_index(op.f('ix_meal_feedbacks_meal_menu_id'), 'meal_feedbacks', ['meal_menu_id'], unique=False)
    op.create_index(op.f('ix_meal_feedbacks_user_id'), 'meal_feedbacks', ['user_id'], unique=False)
    
    # Create meal_attendances table
    op.create_table('meal_attendances',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('meal_menu_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('marked_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['meal_menu_id'], ['meal_menus.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('meal_menu_id', 'user_id', name='unique_attendance_per_user_per_meal')
    )
    op.create_index(op.f('ix_meal_attendances_meal_menu_id'), 'meal_attendances', ['meal_menu_id'], unique=False)
    op.create_index(op.f('ix_meal_attendances_user_id'), 'meal_attendances', ['user_id'], unique=False)


def downgrade():
    # Drop tables
    op.drop_index(op.f('ix_meal_attendances_user_id'), table_name='meal_attendances')
    op.drop_index(op.f('ix_meal_attendances_meal_menu_id'), table_name='meal_attendances')
    op.drop_table('meal_attendances')
    
    op.drop_index(op.f('ix_meal_feedbacks_user_id'), table_name='meal_feedbacks')
    op.drop_index(op.f('ix_meal_feedbacks_meal_menu_id'), table_name='meal_feedbacks')
    op.drop_table('meal_feedbacks')
    
    op.drop_index(op.f('ix_meal_menus_meal_date'), table_name='meal_menus')
    op.drop_table('meal_menus')
    
    # Drop ENUM type
    meal_types_enum = postgresql.ENUM(
        'breakfast',
        'lunch',
        'snacks',
        'dinner',
        name='meal_types',
        create_type=False
    )
    meal_types_enum.drop(op.get_bind(), checkfirst=True)
