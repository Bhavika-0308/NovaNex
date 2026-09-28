import json
from uuid import uuid4
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.analysis import PolicyAnalysis, AnalysisAdditionalInformation
from app.models.policy import Policy

class CoverageService:
    def _rules(self, policy: Policy):
        try:
            return json.loads(policy.rules_json) if policy.rules_json else {}
        except json.JSONDecodeError:
            return {}

    def _find_rule(self, rules: dict, treatment: str):
        treatments = rules.get("treatments", {}) if isinstance(rules, dict) else {}
        if not isinstance(treatments, dict):
            return None
        for name, rule in treatments.items():
            if str(name).casefold() == treatment.casefold():
                return rule
        return None

    def calculate(self, policy: Policy, treatment: str, treatment_cost: float, patient: dict, additional: dict | None = None):
        info = {**(patient or {}), **(additional or {})}
        rule = self._find_rule(self._rules(policy), treatment)
        missing = []
        reasons = []
        if not rule:
            return None, None, 0.0, ["No treatment-specific coverage rule is available in the processed policy data"], ["treatment_coverage_rule"]

        required = rule.get("required_information", [])
        for field in required:
            if info.get(field) in (None, ""):
                missing.append(field)
        if missing:
            return None, None, 0.0, ["Additional policy or patient information is required before estimating coverage"], missing

        if rule.get("covered") is False:
            reasons.append("The processed policy rule marks this treatment as excluded or not covered")
            return 0.0, treatment_cost, 0.75, reasons, []

        coverage_pct = float(rule.get("coverage_percentage", 0))
        if coverage_pct < 0 or coverage_pct > 100:
            return None, None, 0.0, ["Coverage percentage in policy data is invalid"], ["valid_coverage_percentage"]
        eligible = treatment_cost * coverage_pct / 100.0
        limit = rule.get("max_limit")
        if limit is not None:
            eligible = min(eligible, float(limit))
            reasons.append("Policy-specific coverage limit was applied")
        deductible = float(rule.get("deductible", 0) or 0)
        eligible = max(0.0, eligible - deductible)
        if deductible:
            reasons.append("Policy-specific deductible was applied")
        copay = float(rule.get("copay_percentage", 0) or 0)
        if copay < 0 or copay > 100:
            return None, None, 0.0, ["Co-payment percentage in policy data is invalid"], ["valid_copay_percentage"]
        patient_share = eligible * copay / 100.0
        coverage = max(0.0, eligible - patient_share)
        oop = max(0.0, treatment_cost - coverage)
        if copay:
            reasons.append("Policy-specific co-payment was applied")
        reasons.insert(0, "Potential coverage is calculated from the processed policy rule; actual insurer payment may differ")
        confidence = 0.85
        return coverage, oop, confidence, reasons, []

    def create_analysis(self, db: Session, policy: Policy, treatment: str, cost: float, patient: dict):
        coverage, oop, confidence, reasons, missing = self.calculate(policy, treatment, cost, patient)
        analysis = PolicyAnalysis(id=str(uuid4()), policy_id=policy.id, treatment=treatment, estimated_cost=cost, potential_coverage=coverage, potential_oop=oop, confidence=confidence, reasons_json=json.dumps(reasons), missing_information_json=json.dumps(missing), citations_json="[]", patient_details_json=json.dumps(patient))
        db.add(analysis); db.commit(); db.refresh(analysis)
        return analysis

    def recalculate(self, db: Session, analysis: PolicyAnalysis, additional: dict):
        policy = analysis.policy
        patient = json.loads(analysis.patient_details_json or "{}")
        coverage, oop, confidence, reasons, missing = self.calculate(policy, analysis.treatment, analysis.estimated_cost, patient, additional)
        analysis.potential_coverage = coverage
        analysis.potential_oop = oop
        analysis.confidence = confidence
        analysis.reasons_json = json.dumps(reasons)
        analysis.missing_information_json = json.dumps(missing)
        if analysis.additional_information:
            analysis.additional_information.information_json = json.dumps({**json.loads(analysis.additional_information.information_json or "{}"), **additional})
        else:
            analysis.additional_information = AnalysisAdditionalInformation(id=str(uuid4()), information_json=json.dumps(additional))
        db.commit(); db.refresh(analysis)
        return analysis

coverage_service = CoverageService()
