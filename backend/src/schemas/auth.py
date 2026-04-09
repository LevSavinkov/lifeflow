from pydantic import BaseModel, EmailStr, Field

from src.schemas.user import UserRead


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4)
    remember_me: bool | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4)
    device_name: str | None = None
    remember_me: bool | None = None


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class RefreshRequest(BaseModel):
    device_name: str | None = None
    remember_me: bool | None = None
