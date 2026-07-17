import os
import tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.mktemp(suffix='.db')}"

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_debug_endpoint_does_not_leak_database_url():
    response = client.get("/api/v1/debug")
    assert response.status_code == 200
    body = response.json()
    assert "db_url" not in body
    assert body["success"] is True
