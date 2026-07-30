from backend.app.auth.security import hash_password, verify_password, create_access_token, decode_access_token


def test_hash_password_and_verify_correct_password():
    hashed = hash_password("password123")
    assert hashed != "password123"
    assert verify_password("password123", hashed) is True


def test_verify_rejects_wrong_password():
    hashed = hash_password("password123")
    assert verify_password("wrong-password", hashed) is False


def test_create_and_decode_access_token_round_trip():
    token = create_access_token({"sub": "1", "role": "patient"})
    payload = decode_access_token(token)
    assert payload["sub"] == "1"
    assert payload["role"] == "patient"
