from backend.core.database import SessionLocal
from backend.models.users import User
from backend.models.categories import Category
from backend.models.products import Product
from backend.models.inventory import InventoryMovement
from sqlalchemy.orm import configure_mappers
from sqlalchemy import text
from backend.config.logger import get_dynamic_logger

logger = get_dynamic_logger("add_cat_pos")

configure_mappers()

db = SessionLocal()
try:
    db.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;"))
    # Set initial positions based on current order
    cats = db.execute(text("SELECT id FROM categories ORDER BY id;")).fetchall()
    for i, row in enumerate(cats):
        db.execute(text("UPDATE categories SET position = :pos WHERE id = :id;"), {"pos": i, "id": row[0]})
    db.commit()
    logger.info("SUCCESS: Column 'position' added and initialized.")
except Exception as e:
    db.rollback()
    logger.error(f"FAILED: {e}")
finally:
    db.close()
