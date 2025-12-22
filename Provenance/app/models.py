import uuid
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from .db import Base

class ProvenanceRecord(Base):
    __tablename__ = "provenance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    score_id = Column(String, index=True, nullable=False)
    product_id = Column(String, index=True, nullable=False)

    pipeline_version = Column(String, nullable=True)
    dvc_commit = Column(String, nullable=True)
    dvc_stage = Column(String, nullable=True)
    mlflow_run_id = Column(String, nullable=True)

    inputs_hash = Column(String, nullable=True)
    artifact_uri = Column(Text, nullable=True)

    summary_json = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
