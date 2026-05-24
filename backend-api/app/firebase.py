from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore, storage as fb_storage

from .config import get_settings


def _ensure_app_initialized() -> None:
    settings = get_settings()

    if not settings.firebase_service_account_path.exists():
        raise FileNotFoundError(
            "No se encontro el archivo de credenciales de Firebase. "
            "Configura FIREBASE_SERVICE_ACCOUNT_PATH en .env. "
            "Ruta resuelta actual: "
            f"{settings.firebase_service_account_path}"
        )

    if not firebase_admin._apps:
        credential = credentials.Certificate(
            str(settings.firebase_service_account_path)
        )
        options: dict = {}
        bucket = settings.firebase_storage_bucket.strip()
        if bucket:
            options["storageBucket"] = bucket
        firebase_admin.initialize_app(credential, options)


@lru_cache(maxsize=1)
def get_firestore_client() -> firestore.Client:
    _ensure_app_initialized()
    return firestore.client()


def get_storage_bucket():
    _ensure_app_initialized()
    return fb_storage.bucket()
