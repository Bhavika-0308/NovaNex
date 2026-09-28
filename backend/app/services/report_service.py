import json
from app.models.analysis import PolicyAnalysis
class ReportService:
    def build(self, analysis: PolicyAnalysis):
        policy = analysis.policy
        overview = json.loads(policy.overview_json) if policy.overview_json else {}
        return {
            "policy_summary": overview.get("coverage_summary"),
            "treatment": analysis.treatment,
            "estimated_cost": analysis.estimated_cost,
            "potential_coverage": analysis.potential_coverage,
            "potential_oop": analysis.potential_oop,
            "confidence": analysis.confidence,
            "reasons": json.loads(analysis.reasons_json or "[]"),
            "citations": json.loads(analysis.citations_json or "[]"),
        }
report_service = ReportService()
