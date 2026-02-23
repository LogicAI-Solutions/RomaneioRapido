from sqlalchemy.orm import Session
from backend.models.users import User
from backend.core import database
from passlib.context import CryptContext
import os
from backend.config.logger import get_dynamic_logger

logger = get_dynamic_logger("init_db")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db(db: Session = next(database.get_db())):
    admin_email = os.getenv("PGADMIN_DEFAULT_EMAIL")
    admin_password = os.getenv("PGADMIN_DEFAULT_PASSWORD")

    if not admin_email or not admin_password:
        logger.warning("PGADMIN_DEFAULT_EMAIL or PGADMIN_DEFAULT_PASSWORD not set in .env")
        return

    user = db.query(User).filter(User.email == admin_email).first()
    if not user:
        logger.info(f"Creating admin user: {admin_email}")
        hashed_password = pwd_context.hash(admin_password)
        db_user = User(
            email=admin_email,
            hashed_password=hashed_password,
            is_admin=True,
            plan_id="enterprise",
            is_active=True,
            full_name="Administrador"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info("Admin user created successfully")
    else:
        logger.info("Admin user already exists")
