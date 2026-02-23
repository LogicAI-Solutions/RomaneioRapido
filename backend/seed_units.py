import os
import sys

# Injecting ENVs early so database.py picks them up
os.environ["POSTGRES_USER"] = "romaneio"
os.environ["POSTGRES_PASSWORD"] = "romaneio123"
os.environ["POSTGRES_DB"] = "romaneio_rapido"

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.core.database import SessionLocal
from backend.models.products import Product
from backend.models.categories import Category
from backend.models.inventory import InventoryMovement

def seed_units():
    db = SessionLocal()
    try:
        print("Limpando bancos...")
        
        # Deleta na ordem correta para nao violar foreign keys
        db.query(InventoryMovement).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.commit()
        
        print("Criando categorias...")
        cat_eletro = Category(name="Eletronicos", description="Aparelhos e cabos")
        cat_alimentos = Category(name="Alimentos", description="Pereciveis e nao pereciveis")
        cat_construcao = Category(name="Construcao", description="Materiais de construcao")
        db.add_all([cat_eletro, cat_alimentos, cat_construcao])
        db.commit()

        print("Criando novos produtos de teste por unidade...")
        
        # Produto Inteiro (UN)
        p1 = Product(
            name="Cabo USB-C",
            sku="CABO-001",
            barcode="7891234567891",
            price=25.0,
            stock_quantity=100,
            min_stock=10,
            unit="UN",
            category_id=cat_eletro.id
        )
        
        # Produto Inteiro (PCT)
        p2 = Product(
            name="Arroz 5kg",
            sku="ARZ-001",
            barcode="7891234567892",
            price=22.5,
            stock_quantity=50,
            min_stock=5,
            unit="PCT",
            category_id=cat_alimentos.id
        )

        # Produto Inteiro (CX)
        p3 = Product(
            name="Caixa de Pacoquita",
            sku="PAC-001",
            barcode="7891234567893",
            price=45.0,
            stock_quantity=20,
            min_stock=2,
            unit="CX",
            category_id=cat_alimentos.id
        )

        # Produto Float (KG)
        p4 = Product(
            name="Carne (Picanha)",
            sku="PIC-001",
            barcode="7891234567894",
            price=65.90,
            stock_quantity=15.5,
            min_stock=5.0,
            unit="KG",
            category_id=cat_alimentos.id
        )

        # Produto Float (M2)
        p5 = Product(
            name="Lona Plastica Azul",
            sku="LON-001",
            barcode="7891234567895",
            price=12.50,
            stock_quantity=200.5,
            min_stock=50.0,
            unit="M2",
            category_id=cat_construcao.id
        )

        # Produto Float (L)
        p6 = Product(
            name="Tinta Branca",
            sku="TIN-001",
            barcode="7891234567896",
            price=18.90,
            stock_quantity=80.5,
            min_stock=10.0,
            unit="L",
            category_id=cat_construcao.id
        )

        db.add_all([p1, p2, p3, p4, p5, p6])
        db.commit()
        
        print("OK! Banco de dados re-semeado com sucesso!")
        
    except Exception as e:
        import traceback
        print(f"Erro ao semear db:")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_units()
