from fastapi import APIRouter
from ..models.transaction import BalanceResponse
from ..services import balance_service

router = APIRouter(prefix="/balance", tags=["balance"])


@router.get("", response_model=BalanceResponse)
def get_balance():
    return {"balance": balance_service.get_current_balance()}
