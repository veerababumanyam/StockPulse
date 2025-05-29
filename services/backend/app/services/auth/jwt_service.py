"""
JWT Token Service for authentication.
Implements HS256 algorithm with HttpOnly cookie management.
"""
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import HTTPException, Request, Response, status
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()


class JWTService:
    """JWT token service with HttpOnly cookie management."""

    def __init__(self):
        self.algorithm = settings.ALGORITHM
        self.secret_key = settings.SECRET_KEY
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.refresh_token_expire_days = settings.REFRESH_TOKEN_EXPIRE_DAYS

    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "refresh"})
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None

    def set_auth_cookies(
        self, response: Response, access_token: str, refresh_token: str
    ):
        """Set HttpOnly authentication cookies."""
        # Set access token cookie
        response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            max_age=settings.COOKIE_MAX_AGE,
            httponly=settings.COOKIE_HTTPONLY,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path="/",
        )

        # Set refresh token cookie with longer expiration
        response.set_cookie(
            key="refresh_token",
            value=f"Bearer {refresh_token}",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS
            * 24
            * 60
            * 60,  # Convert days to seconds
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path="/api/v1/auth/refresh",  # Restrict refresh token to refresh endpoint
        )

    def clear_auth_cookies(self, response: Response):
        """Clear authentication cookies."""
        response.delete_cookie(key="access_token", path="/")
        response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh")

    def get_token_from_cookie(
        self, request: Request, cookie_name: str
    ) -> Optional[str]:
        """Extract token from cookie."""
        cookie_value = request.cookies.get(cookie_name)
        if cookie_value and cookie_value.startswith("Bearer "):
            return cookie_value[7:]  # Remove "Bearer " prefix
        return None

    def get_current_user_data(self, request: Request) -> Optional[Dict[str, Any]]:
        """Get current user data from access token cookie."""
        token = self.get_token_from_cookie(request, "access_token")
        if not token:
            return None

        payload = self.verify_token(token)
        if not payload or payload.get("type") != "access":
            return None

        return payload


class CSRFService:
    """CSRF protection service using double-submit cookie pattern."""

    @staticmethod
    def generate_csrf_token() -> str:
        """Generate CSRF token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    def set_csrf_cookie(response: Response, token: str):
        """Set CSRF token cookie."""
        response.set_cookie(
            key="csrf_token",
            value=token,
            max_age=3600,  # 1 hour
            httponly=False,  # Must be accessible to JavaScript
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path="/",
        )

    @staticmethod
    def validate_csrf_token(request: Request) -> bool:
        """Validate CSRF token using double-submit pattern."""
        header_token = request.headers.get("X-CSRF-Token")
        cookie_token = request.cookies.get("csrf_token")

        if not header_token or not cookie_token:
            return False

        return secrets.compare_digest(header_token, cookie_token)


# Service instances
jwt_service = JWTService()
csrf_service = CSRFService()
