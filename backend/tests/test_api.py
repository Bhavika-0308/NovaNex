import io
import json
import uuid
from app.models.policy import Policy
from app.models.analysis import PolicyAnalysis
from app.db import SessionLocal
from tests.conftest import signup_and_login

def test_signup_login_me(client):
    headers = signup_and_login(client)
    r = client.get("/api/auth/me", headers=headers)
    assert r.status_code == 200
    assert r.json()["email"] == "guest@insuresight.local"

def test_login_accepts_any_credentials(client):
    first = client.post("/api/auth/login", json={"email": "not an email", "password": ""})
    second = client.post("/api/auth/login", json={})
    assert first.status_code == 200
    assert second.status_code == 200
    first_user = client.get("/api/auth/me", headers={"Authorization": f"Bearer {first.json()['access_token']}"})
    second_user = client.get("/api/auth/me", headers={"Authorization": f"Bearer {second.json()['access_token']}"})
    assert first_user.json()["id"] == second_user.json()["id"]

def test_invalid_pdf(client):
    headers = signup_and_login(client)
    r = client.post("/api/policies/upload", headers=headers, files={"file": ("bad.pdf", b"not pdf", "application/pdf")})
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "INVALID_PDF"

def test_policy_upload_is_shared_with_guest_sessions(client):
    headers = signup_and_login(client, "a@example.com")
    pdf = b"%PDF-1.4\n%test"
    # Minimal header is not a readable PDF, so generate via fitz in test instead.
    import fitz
    doc = fitz.open(); page = doc.new_page(); page.insert_text((72,72), "Policy document")
    data = doc.tobytes(); doc.close()
    r = client.post("/api/policies/upload", headers=headers, files={"file": ("policy.pdf", data, "application/pdf")})
    assert r.status_code == 202
    pid = r.json()["policy_id"]
    assert client.get(f"/api/policies/{pid}", headers=headers).status_code == 200
    other = signup_and_login(client, "b@example.com")
    assert client.get(f"/api/policies/{pid}", headers=other).status_code == 200

def test_cost_no_dataset(client):
    headers = signup_and_login(client)
    r = client.post("/api/cost/analyze", headers=headers, json={"treatment":"Knee Replacement","age":45,"location":"Pune"})
    assert r.status_code == 404

def test_coverage_missing_information(client):
    headers = signup_and_login(client)
    pid = str(uuid.uuid4())
    db = SessionLocal()
    from app.models.user import User
    user = db.query(User).filter(User.email == "guest@insuresight.local").first()
    policy = Policy(id=pid, user_id=user.id, filename="p.pdf", file_path="/tmp/p.pdf", status="completed", overview_json=json.dumps({"coverage_summary":"test"}), rules_json=json.dumps({"treatments":{"Knee Replacement":{"covered":True,"coverage_percentage":80,"required_information":["network_status"]}}}))
    db.add(policy); db.commit(); db.close()
    r = client.post("/api/coverage/analyze", headers=headers, json={"policy_id":pid,"treatment":"Knee Replacement","treatment_cost":250000,"patient_details":{"age":45,"location":"Pune"}})
    assert r.status_code == 200
    assert "network_status" in r.json()["missing_information"]
    assert r.json()["potential_coverage"] is None

def test_recalculate_and_report(client):
    headers = signup_and_login(client)
    pid = str(uuid.uuid4())
    db = SessionLocal(); from app.models.user import User
    user = db.query(User).filter(User.email == "guest@insuresight.local").first()
    policy = Policy(id=pid, user_id=user.id, filename="p.pdf", file_path="/tmp/p.pdf", status="completed", overview_json=json.dumps({"coverage_summary":"Knee cover"}), rules_json=json.dumps({"treatments":{"Knee Replacement":{"covered":True,"coverage_percentage":80,"required_information":["network_status"],"copay_percentage":10}}}))
    db.add(policy); db.commit(); db.close()
    r = client.post("/api/coverage/analyze", headers=headers, json={"policy_id":pid,"treatment":"Knee Replacement","treatment_cost":250000,"patient_details":{"age":45,"location":"Pune"}})
    aid = r.json()["analysis_id"]
    r = client.post("/api/coverage/recalculate", headers=headers, json={"analysis_id":aid,"additional_information":{"network_status":"network"}})
    assert r.status_code == 200
    assert r.json()["potential_coverage"] is not None
    r = client.get(f"/api/reports/{aid}", headers=headers)
    assert r.status_code == 200
    assert r.json()["treatment"] == "Knee Replacement"

def test_unauthorized(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.post("/api/assistant/ask", json={"policy_id":"x","question":"test"}).status_code == 401
