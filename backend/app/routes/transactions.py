from fastapi import APIRouter, HTTPException, status
from ..models.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionUpdate,
)
from ..services import balance_service

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionResponse])
def list_transactions():
    return balance_service.get_transactions()


@router.post(
    "", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED
)
def create_transaction(payload: TransactionCreate):
    balance_service.create_transaction(payload)
    transactions = balance_service.get_transactions()
    return transactions[-1]


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(transaction_id: str, payload: TransactionUpdate):
    updated = balance_service.update_transaction(transaction_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for transaction in balance_service.get_transactions():
        if transaction["id"] == transaction_id:
            return transaction

    raise HTTPException(status_code=404, detail="Transaction not found")


@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: str):
    return balance_service.delete_transaction(transaction_id)


@router.get("/deleted")
def get_deleted_transactions():
    return balance_service.get_deleted_transactions()
