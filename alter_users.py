from backend.core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR"))
    db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS store_name VARCHAR"))
    db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_base64 TEXT"))
    db.commit()
    print("Columns added successfully")
except Exception as e:
    print(f"Error adding columns: {e}")
finally:
    db.close()
