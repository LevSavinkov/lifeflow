from src.utils.security import (
    create_access_token,
    decode_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)


def test_password_hash_and_verify() -> None:
    password = "StrongPassword123!"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True


def test_access_token_roundtrip() -> None:
    token = create_access_token(subject="42", session_id="sid-1")
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["sid"] == "sid-1"
    assert payload["role"] == "user"
    assert payload["exp"] > payload["iat"]


def test_refresh_token_hash_is_stable() -> None:
    refresh = generate_refresh_token()
    assert hash_refresh_token(refresh) == hash_refresh_token(refresh)
