from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import ProvenanceRecord
from ..schemas import ProvenanceCreate, ProvenanceOut
from ..minio_client import upload_json
import hashlib, json

router = APIRouter(prefix="/provenance", tags=["Provenance"])

def calc_hash(summary: dict) -> str:
    raw = json.dumps(summary, sort_keys=True).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()

@router.post("/record", response_model=ProvenanceOut)
def record(payload: ProvenanceCreate, db: Session = Depends(get_db)):
    inputs_hash = payload.inputs_hash or calc_hash(payload.summary_json)

    # ✅ MinIO optionnel: si MinIO est down -> on continue quand même
    minio_path = f"{payload.product_id}/{payload.score_id}/summary.json"
    artifact_uri = None
    try:
        artifact_uri = upload_json(minio_path, payload.summary_json)
    except Exception as e:
        print("⚠️ MinIO upload failed:", str(e))
        artifact_uri = None

    rec = ProvenanceRecord(
        score_id=payload.score_id,
        product_id=payload.product_id,
        pipeline_version=payload.pipeline_version,
        dvc_commit=payload.dvc_commit,
        dvc_stage=payload.dvc_stage,
        mlflow_run_id=payload.mlflow_run_id,
        inputs_hash=inputs_hash,
        artifact_uri=artifact_uri,
        summary_json=payload.summary_json
    )

    db.add(rec)
    db.commit()
    db.refresh(rec)

    return ProvenanceOut(
        score_id=rec.score_id,
        product_id=rec.product_id,
        pipeline_version=rec.pipeline_version,
        dvc_commit=rec.dvc_commit,
        dvc_stage=rec.dvc_stage,
        mlflow_run_id=rec.mlflow_run_id,
        inputs_hash=rec.inputs_hash,
        artifact_uri=rec.artifact_uri,
        summary_json=rec.summary_json
    )

@router.get("/{score_id}", response_model=ProvenanceOut)
def get(score_id: str, db: Session = Depends(get_db)):
    rec = (
        db.query(ProvenanceRecord)
        .filter(ProvenanceRecord.score_id == score_id)
        .order_by(ProvenanceRecord.created_at.desc())
        .first()
    )
    if not rec:
        raise HTTPException(status_code=404, detail="No provenance for this score_id")

    return ProvenanceOut(
        score_id=rec.score_id,
        product_id=rec.product_id,
        pipeline_version=rec.pipeline_version,
        dvc_commit=rec.dvc_commit,
        dvc_stage=rec.dvc_stage,
        mlflow_run_id=rec.mlflow_run_id,
        inputs_hash=rec.inputs_hash,
        artifact_uri=rec.artifact_uri,
        summary_json=rec.summary_json
    )
