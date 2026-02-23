import random
from backend.core.database import SessionLocal
from backend.models.users import User
from backend.models.categories import Category
from backend.models.products import Product
from backend.models.inventory import InventoryMovement
from sqlalchemy.orm import configure_mappers
from backend.config.logger import get_dynamic_logger

logger = get_dynamic_logger("seed_db")

configure_mappers()

def seed_database():
    db = SessionLocal()
    try:
        # Check if already seeded to avoid duplicates
        if db.query(Category).count() > 0:
            logger.info("Database already has categories. Skipping seed to avoid duplicates.")
            return

        logger.info("Seeding database with categories and products...")

        # Create Categories
        categories_data = [
            {"name": "Eletrônicos", "description": "Celulares, notebooks e acessórios"},
            {"name": "Vestuário", "description": "Roupas masculinas e femininas"},
            {"name": "Alimentos", "description": "Comidas e bebidas em geral"},
            {"name": "Ferramentas", "description": "Ferramentas manuais e elétricas"},
        ]
        
        db_categories = []
        for cat_data in categories_data:
            cat = Category(**cat_data)
            db.add(cat)
            db_categories.append(cat)
        
        db.commit()
        for cat in db_categories:
            db.refresh(cat)

        # Create Products
        products_data = [
            # Eletrônicos
            {"name": "Smartphone Galaxy S23", "category": db_categories[0], "sku": "ELET-SM-001", "barcode": "7891234567890", "price": 4500.0, "cost_price": 3000.0, "stock_quantity": 15, "min_stock": 5, "unit": "UN"},
            {"name": "Notebook Dell Inspiron", "category": db_categories[0], "sku": "ELET-NB-002", "barcode": "7891234567891", "price": 3500.0, "cost_price": 2500.0, "stock_quantity": 8, "min_stock": 2, "unit": "UN"},
            {"name": "Fone Bluetooth JBL", "category": db_categories[0], "sku": "ELET-FN-003", "barcode": "7891234567892", "price": 250.0, "cost_price": 100.0, "stock_quantity": 40, "min_stock": 10, "unit": "UN"},
            {"name": "Cabo USB-C 2 Metros", "category": db_categories[0], "sku": "ELET-CB-004", "barcode": "7891234567893", "price": 45.0, "cost_price": 15.0, "stock_quantity": 120, "min_stock": 30, "unit": "UN"},
            
            # Vestuário
            {"name": "Camiseta Básica Preta M", "category": db_categories[1], "sku": "VEST-CM-001", "barcode": "7899876543210", "price": 60.0, "cost_price": 20.0, "stock_quantity": 50, "min_stock": 15, "unit": "UN"},
            {"name": "Calça Jeans Slim Tam 40", "category": db_categories[1], "sku": "VEST-CJ-002", "barcode": "7899876543211", "price": 120.0, "cost_price": 45.0, "stock_quantity": 30, "min_stock": 10, "unit": "UN"},
            {"name": "Jaqueta de Couro P", "category": db_categories[1], "sku": "VEST-JQ-003", "barcode": "7899876543212", "price": 350.0, "cost_price": 150.0, "stock_quantity": 5, "min_stock": 2, "unit": "UN"},
            
            # Alimentos
            {"name": "Café Torrado Especial 500g", "category": db_categories[2], "sku": "ALIM-CF-001", "barcode": "7894561230123", "price": 25.0, "cost_price": 12.0, "stock_quantity": 80, "min_stock": 20, "unit": "PCT"},
            {"name": "Arroz Branco Tipo 1 5kg", "category": db_categories[2], "sku": "ALIM-AR-002", "barcode": "7894561230124", "price": 30.0, "cost_price": 18.0, "stock_quantity": 200, "min_stock": 50, "unit": "PCT"},
            {"name": "Azeite de Oliva Extra Virgem 500ml", "category": db_categories[2], "sku": "ALIM-AZ-003", "barcode": "7894561230125", "price": 45.0, "cost_price": 25.0, "stock_quantity": 60, "min_stock": 15, "unit": "UN"},
            {"name": "Refrigerante Cola 2L", "category": db_categories[2], "sku": "ALIM-RF-004", "barcode": "7894561230126", "price": 10.0, "cost_price": 4.5, "stock_quantity": 150, "min_stock": 40, "unit": "UN"},
            
            # Ferramentas
            {"name": "Furadeira de Impacto 500W", "category": db_categories[3], "sku": "FERR-FR-001", "barcode": "7893216540123", "price": 180.0, "cost_price": 90.0, "stock_quantity": 25, "min_stock": 5, "unit": "UN"},
            {"name": "Jogo de Chaves 40 Peças", "category": db_categories[3], "sku": "FERR-JC-002", "barcode": "7893216540124", "price": 150.0, "cost_price": 70.0, "stock_quantity": 18, "min_stock": 5, "unit": "CX"},
            {"name": "Martelo Unha 27mm", "category": db_categories[3], "sku": "FERR-MT-003", "barcode": "7893216540125", "price": 45.0, "cost_price": 20.0, "stock_quantity": 40, "min_stock": 10, "unit": "UN"},
            {"name": "Prego 18x27 (Pacote 1kg)", "category": db_categories[3], "sku": "FERR-PR-004", "barcode": "7893216540126", "price": 25.0, "cost_price": 10.0, "stock_quantity": 100, "min_stock": 20, "unit": "KG"},
        ]

        for p_data in products_data:
            cat = p_data.pop("category")
            prod = Product(**p_data, category_id=cat.id)
            db.add(prod)
        
        db.commit()
        logger.info(f"Successfully added {len(categories_data)} categories and {len(products_data)} products.")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
