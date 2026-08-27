from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

TransactionType = Literal["add", "subtract"]


class TransactionCreate(BaseModel):
    type: TransactionType
    amount: float = Field(gt=0, le=1_000_000_000)
    description: str = Field(default="", max_length=300)
    owner: str = Field(
        min_length=1,
        max_length=100,
    )


class TransactionUpdate(BaseModel):
    type: TransactionType
    amount: float = Field(gt=0, le=1_000_000_000)
    description: str = Field(default="", max_length=300)


class TransactionResponse(BaseModel):
    id: str
    type: TransactionType
    amount: float
    description: str
    createdAt: datetime
    updatedAt: datetime
    balanceAfter: float
    owner: str


class BalanceResponse(BaseModel):
    balance: float
