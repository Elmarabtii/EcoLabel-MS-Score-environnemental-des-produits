import io, json
from minio import Minio
from .config import settings

client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=False
)

def ensure_bucket():
    if not client.bucket_exists(settings.MINIO_BUCKET):
        client.make_bucket(settings.MINIO_BUCKET)

def upload_json(path: str, data: dict) -> str:
    ensure_bucket()
    payload = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
    client.put_object(
        settings.MINIO_BUCKET,
        path,
        io.BytesIO(payload),
        length=len(payload),
        content_type="application/json"
    )
    return f"s3://{settings.MINIO_BUCKET}/{path}"
