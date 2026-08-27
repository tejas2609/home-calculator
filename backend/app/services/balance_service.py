from datetime import datetime, timezone
from google.cloud import firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
from ..firebase import db

TRANSACTIONS = "transactions"
DELETED_TRANSACTIONS = "deletedTransactions"
BALANCE_DOC = db.collection("balances").document("main")


def _sort_key(created_at, doc_id):
    return (created_at.timestamp() if created_at else 0, doc_id)


def _serialize(snapshot):
    data = snapshot.to_dict()
    return {
        "id": snapshot.id,
        "type": data["type"],
        "amount": float(data["amount"]),
        "description": data.get("description", ""),
        "createdAt": data["createdAt"],
        "updatedAt": data.get("updatedAt", data["createdAt"]),
        "balanceAfter": float(data.get("balanceAfter", 0)),
        "owner": data.get("owner", ""),
    }


def _recalculate_in_transaction(transaction, upsert_doc=None, delete_ref=None):
    """
    Reads all transactions, merges in an in-memory create/update (not yet
    committed), computes running balances, then performs all writes.
    upsert_doc: optional (ref, data_dict) representing a doc being
    created or updated in this same transaction.
    """
    # ---- READ PHASE ----
    snapshots = list(db.collection(TRANSACTIONS).stream(transaction=transaction))
    docs = [(s.reference, s.to_dict()) for s in snapshots]

    if delete_ref:
        docs = [(ref, data) for ref, data in docs if ref.id != delete_ref.id]

    if upsert_doc:
        upsert_ref, upsert_data = upsert_doc
        docs = [(ref, data) for ref, data in docs if ref.id != upsert_ref.id]
        docs.append((upsert_ref, upsert_data))

    docs.sort(key=lambda item: _sort_key(item[1].get("createdAt"), item[0].id))

    balance = 0.0
    planned_updates = []
    for ref, data in docs:
        amount = round(float(data["amount"]), 2)
        balance = round(
            balance + amount if data["type"] == "add" else balance - amount,
            2,
        )
        planned_updates.append((ref, data, balance))

    # ---- WRITE PHASE ----
    for ref, data, balance_after in planned_updates:
        merged = dict(data)
        merged["balanceAfter"] = balance_after
        merged["updatedAt"] = SERVER_TIMESTAMP
        transaction.set(ref, merged, merge=True)

    transaction.set(
        BALANCE_DOC,
        {
            "currentBalance": balance,
            "updatedAt": SERVER_TIMESTAMP,
        },
        merge=True,
    )
    return balance


def create_transaction(payload):
    new_ref = db.collection(TRANSACTIONS).document()
    transaction = db.transaction()

    @firestore.transactional
    def operation(transaction):
        now = datetime.now(timezone.utc)
        new_data = {
            "type": payload.type,
            "amount": round(float(payload.amount), 2),
            "description": payload.description.strip(),
            "createdAt": now,
            "updatedAt": now,
            "balanceAfter": 0,
            "owner": payload.owner.strip(),
        }
        # Reads happen inside _recalculate_in_transaction; new doc write
        # is issued after that, keeping all reads before all writes.
        _recalculate_in_transaction(transaction, upsert_doc=(new_ref, new_data))

    operation(transaction)


def update_transaction(transaction_id, payload):
    ref = db.collection(TRANSACTIONS).document(transaction_id)
    transaction = db.transaction()

    @firestore.transactional
    def operation(transaction):
        # ---- READ PHASE ----
        snapshot = ref.get(transaction=transaction)
        if not snapshot.exists:
            return False

        updated_data = dict(snapshot.to_dict())
        updated_data.update(
            {
                "type": payload.type,
                "amount": round(float(payload.amount), 2),
                "description": payload.description.strip(),
                "updatedAt": datetime.now(timezone.utc),
            }
        )

        # _recalculate_in_transaction does its own read of the whole
        # collection; still fine since no writes have happened yet.
        _recalculate_in_transaction(transaction, upsert_doc=(ref, updated_data))

        # ---- WRITE (the actual field changes for this doc) ----
        transaction.update(
            ref,
            {
                "type": payload.type,
                "amount": round(float(payload.amount), 2),
                "description": payload.description.strip(),
                "updatedAt": updated_data["updatedAt"],
            },
        )
        return True

    return operation(transaction)


def get_transactions():
    snapshots = list(db.collection(TRANSACTIONS).stream())
    snapshots.sort(key=lambda s: _sort_key(s.to_dict().get("createdAt"), s.id))
    return [_serialize(snapshot) for snapshot in snapshots]


def get_deleted_transactions():
    snapshots = list(db.collection(DELETED_TRANSACTIONS).stream())
    snapshots.sort(key=lambda s: _sort_key(s.to_dict().get("createdAt"), s.id))
    return [_serialize(snapshot) for snapshot in snapshots]


def get_current_balance():
    snapshot = BALANCE_DOC.get()
    if not snapshot.exists:
        return 0.0
    return round(float(snapshot.to_dict().get("currentBalance", 0)), 2)


def delete_transaction(transaction_id):
    ref = db.collection(TRANSACTIONS).document(transaction_id)
    transaction = db.transaction()

    @firestore.transactional
    def operation(transaction):
        # ---- READ PHASE ----
        snapshot = ref.get(transaction=transaction)
        if not snapshot.exists:
            return False

        deleted_data = dict(snapshot.to_dict())
        deleted_data["deletedAt"] = datetime.now(timezone.utc)

        _recalculate_in_transaction(transaction, delete_ref=ref)

        # ---- WRITE (the actual deletion) ----
        deleted_ref = db.collection(DELETED_TRANSACTIONS).document(transaction_id)
        transaction.set(deleted_ref, deleted_data)
        transaction.delete(ref)
        return True

    return operation(transaction)
