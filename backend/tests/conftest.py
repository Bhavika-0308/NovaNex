import os
os.environ["DATABASE_URL"] = "sqlite:///./test_policywise.db"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["FRONTEND_URL"] = "http://testserver"
from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine
import pytest

@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

def signup_and_login(client, email="user@example.com"):
    r = client.post("/api/auth/login", json={"email": email, "password": "anything"})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
