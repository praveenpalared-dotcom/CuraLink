import os
import tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mktemp(suffix='.db')}"

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_patient_login_succeeds_with_correct_demo_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "john.doe@gmail.com",
        "password": "password123",
        "session_type": "patient",
    })
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert body["role"] == "patient"
    assert body["user"]["email"] == "john.doe@gmail.com"


def test_patient_login_fails_with_wrong_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "john.doe@gmail.com",
        "password": "wrong-password",
        "session_type": "patient",
    })
    assert response.status_code == 401


def test_patient_login_fails_for_unknown_email():
    response = client.post("/api/v1/auth/login", json={
        "email": "nobody@nowhere.com",
        "password": "password123",
        "session_type": "patient",
    })
    assert response.status_code == 401


def test_staff_login_succeeds_with_correct_demo_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "richard.patel@mediflow.com",
        "password": "password123",
        "session_type": "hospital",
    })
    assert response.status_code == 200
    body = response.json()
    assert body["role"] == "doctor"
    assert body["user"]["email"] == "richard.patel@mediflow.com"


def test_login_rejects_invalid_session_type():
    response = client.post("/api/v1/auth/login", json={
        "email": "john.doe@gmail.com",
        "password": "password123",
        "session_type": "not-a-real-type",
    })
    assert response.status_code == 400
