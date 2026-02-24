from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.security import get_current_user
from backend.core.limiter import limiter
from backend.models.users import User
from backend.schemas.clients import ClientCreate, ClientUpdate, ClientResponse
from backend.crud import clients as crud
from backend.config.logger import get_dynamic_logger

logger = get_dynamic_logger("clients")
router = APIRouter(prefix="/clients")

@router.post("/", response_model=ClientResponse)
@limiter.limit("60/minute")
def create_client(
    request: Request,
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        logger.info(f"Usuário {current_user.email} está criando o cliente {client.name}")
        return crud.create_client(db, client, user_id=current_user.id)
    except Exception as e:
        logger.error(f"Erro ao criar cliente: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/", response_model=List[ClientResponse])
@limiter.limit("120/minute")
def list_clients(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return crud.get_clients(db, user_id=current_user.id, skip=skip, limit=limit, search=search)
    except Exception as e:
        logger.error(f"Erro ao listar clientes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/{client_id}", response_model=ClientResponse)
@limiter.limit("60/minute")
def update_client(
    request: Request,
    client_id: int,
    client: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db_client = crud.update_client(db, client_id, client, user_id=current_user.id)
        if not db_client:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        logger.info(f"Usuário {current_user.email} atualizou o cliente {client_id}")
        return db_client
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar cliente: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/{client_id}", response_model=ClientResponse)
@limiter.limit("60/minute")
def delete_client(
    request: Request,
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db_client = crud.delete_client(db, client_id, user_id=current_user.id)
        if not db_client:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        logger.info(f"Usuário {current_user.email} excluiu o cliente {client_id}")
        return db_client
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao excluir cliente: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
