from pathlib import Path
import pandas as pd
from fastapi import HTTPException
from app.core.config import settings

class CostService:
    def __init__(self):
        self.dataset_path = Path(__file__).resolve().parent.parent / "data" / "cost_dataset.csv"

    def analyze(self, treatment: str, location: str):
        if not self.dataset_path.exists():
            raise HTTPException(status_code=404, detail={"error": {"code": "COST_DATA_UNAVAILABLE", "message": "No cost dataset is configured"}})
        df = pd.read_csv(self.dataset_path)
        required = {"treatment", "location", "estimated_cost", "cost_min", "cost_max"}
        if not required.issubset(df.columns):
            raise HTTPException(status_code=500, detail={"error": {"code": "INVALID_COST_DATASET", "message": "Cost dataset is missing required columns"}})
        mask = (df["treatment"].astype(str).str.casefold() == treatment.casefold()) & (df["location"].astype(str).str.casefold() == location.casefold())
        rows = df.loc[mask]
        if rows.empty:
            # Fall back to treatment-only data only if explicitly present; never estimate a number.
            rows = df.loc[df["treatment"].astype(str).str.casefold() == treatment.casefold()]
        if rows.empty:
            raise HTTPException(status_code=404, detail={"error": {"code": "COST_NOT_FOUND", "message": "No cost estimate exists in the configured dataset"}})
        row = rows.iloc[0]
        return {"treatment": treatment, "location": location, "estimated_cost": float(row.estimated_cost), "cost_min": float(row.cost_min), "cost_max": float(row.cost_max), "source": "cost_dataset"}

cost_service = CostService()
