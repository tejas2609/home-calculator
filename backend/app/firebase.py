import json
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore

from .config import get_settings


def get_db():
    settings = get_settings()

    if not firebase_admin._apps:

        # Production:
        # Firebase credentials are stored as a JSON string
        # in the FIREBASE_SERVICE_ACCOUNT_JSON environment variable.
        if settings.firebase_service_account_json:
            try:
                service_account_info = json.loads(
                    settings.firebase_service_account_json
                )

                credential = credentials.Certificate(service_account_info)

            except json.JSONDecodeError as error:
                raise RuntimeError(
                    "FIREBASE_SERVICE_ACCOUNT_JSON contains invalid JSON."
                ) from error

        # Local development:
        # Firebase credentials are read from a local JSON file.
        elif settings.firebase_service_account_path:
            service_account_path = Path(settings.firebase_service_account_path)

            if not service_account_path.is_absolute():
                service_account_path = Path.cwd() / service_account_path

            if not service_account_path.exists():
                raise RuntimeError(
                    "Firebase service account file not found: "
                    f"{service_account_path}"
                )

            credential = credentials.Certificate(str(service_account_path))

        else:
            raise RuntimeError(
                "Firebase credentials are not configured. "
                "Set FIREBASE_SERVICE_ACCOUNT_PATH for local development "
                "or FIREBASE_SERVICE_ACCOUNT_JSON for production."
            )

        firebase_admin.initialize_app(
            credential,
            {
                "projectId": settings.firebase_project_id,
            },
        )

    return firestore.client()


db = get_db()
