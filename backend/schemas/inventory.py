from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from backend.models.inventory import MovementType


class InventoryMovementBase(BaseModel):
    product_id: int
    quantity: float
    movement_type: MovementType
    notes: Optional[str] = None


class InventoryMovementCreate(InventoryMovementBase):
    pass


class InventoryMovementResponse(InventoryMovementBase):
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StockLevel(BaseModel):
    product_id: int
    product_name: str
    barcode: Optional[str] = None
    stock_quantity: float
    min_stock: float
    unit: str = "UN"
    is_low_stock: bool

    class Config:
        from_attributes = True
