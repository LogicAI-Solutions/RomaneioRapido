from sqlalchemy.orm import Session
from backend.models.clients import Client
from backend.schemas.clients import ClientCreate, ClientUpdate
from typing import Optional

def get_clients(db: Session, user_id: int, skip: int = 0, limit: int = 100, search: Optional[str] = None):
    query = db.query(Client).filter(Client.user_id == user_id)
    if search:
        query = query.filter(
            (Client.name.ilike(f"%{search}%")) |
            (Client.phone.ilike(f"%{search}%")) |
            (Client.document.ilike(f"%{search}%"))
        )
    return query.order_by(Client.name.asc()).offset(skip).limit(limit).all()

def count_clients(db: Session, user_id: int, search: Optional[str] = None):
    query = db.query(Client).filter(Client.user_id == user_id)
    if search:
        query = query.filter(
            (Client.name.ilike(f"%{search}%")) |
            (Client.phone.ilike(f"%{search}%")) |
            (Client.document.ilike(f"%{search}%"))
        )
    return query.count()

def get_client(db: Session, client_id: int, user_id: int):
    return db.query(Client).filter(Client.id == client_id, Client.user_id == user_id).first()

def create_client(db: Session, client: ClientCreate, user_id: int):
    db_client = Client(**client.model_dump(), user_id=user_id)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client: ClientUpdate, user_id: int):
    db_client = get_client(db, client_id, user_id)
    if not db_client:
        return None
    
    update_data = client.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_client, key, value)
        
    db.commit()
    db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int, user_id: int):
    db_client = get_client(db, client_id, user_id)
    if not db_client:
        return None
    
    db.delete(db_client)
    db.commit()
    return db_client
