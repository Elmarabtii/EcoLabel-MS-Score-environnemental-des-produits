from pydantic import BaseModel
from typing import Optional, Dict, Any

class ProvenanceCreate(BaseModel):
    score_id: str
    product_id: str
    pipeline_version: Optional[str] = None
    dvc_commit: Optional[str] = None
    dvc_stage: Optional[str] = None
    mlflow_run_id: Optional[str] = None
    inputs_hash: Optional[str] = None
    summary_json: Dict[str, Any]

class ProvenanceOut(BaseModel):
    score_id: str
    product_id: str
    pipeline_version: Optional[str] = None
    dvc_commit: Optional[str] = None
    dvc_stage: Optional[str] = None
    mlflow_run_id: Optional[str] = None
    inputs_hash: Optional[str] = None
    artifact_uri: Optional[str] = None
    summary_json: Dict[str, Any]
