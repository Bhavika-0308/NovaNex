from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base

class PolicyAnalysis(Base):
    __tablename__ = "policy_analyses"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    policy_id: Mapped[str] = mapped_column(ForeignKey("policies.id", ondelete="CASCADE"), index=True, nullable=False)
    treatment: Mapped[str] = mapped_column(String(300), nullable=False)
    estimated_cost: Mapped[float] = mapped_column(Float, nullable=False)
    potential_coverage: Mapped[float | None] = mapped_column(Float)
    potential_oop: Mapped[float | None] = mapped_column(Float)
    confidence: Mapped[float | None] = mapped_column(Float)
    reasons_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    missing_information_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    citations_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    patient_details_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    policy = relationship("Policy", back_populates="analyses")
    additional_information = relationship("AnalysisAdditionalInformation", back_populates="analysis", uselist=False, cascade="all, delete-orphan")

class AnalysisAdditionalInformation(Base):
    __tablename__ = "analysis_additional_information"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    analysis_id: Mapped[str] = mapped_column(ForeignKey("policy_analyses.id", ondelete="CASCADE"), unique=True, nullable=False)
    information_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    analysis = relationship("PolicyAnalysis", back_populates="additional_information")
