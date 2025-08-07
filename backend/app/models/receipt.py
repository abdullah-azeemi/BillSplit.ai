from pydantic import BaseModel
from typing import List

class Item(BaseModel):
    name: str
    price: float

class ParsedReceipt(BaseModel):
    items: List[Item]
    subtotal: float
    tax: float
    total: float
