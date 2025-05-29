"""
Authentication API endpoints.
Implements login, logout, token refresh, and user info endpoints.
"""
import asyncio
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UserResponse,
)
from app.services.auth.jwt_service import csrf_service, jwt_service
from app.services.auth.security_service import security_service
from app.services.auth.user_service import user_service

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["authentication"])

# Note: Rate limit exception handler should be added to the main app, not router


@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    User login endpoint with HttpOnly cookie authentication.

    Implements:
    - Email/password authentication
    - Rate limiting (5 attempts per minute per IP)
    - Account lockout protection
    - HttpOnly cookie setting
    - Security logging
    """
    ip_address = get_remote_address(request)
    user_agent = request.headers.get("user-agent", "")

    try:
        # Check if IP is blocked
        if await security_service.is_ip_blocked(ip_address):
            await security_service.log_security_event(
                "blocked_ip_login_attempt",
                ip_address=ip_address,
                details={"email": credentials.email},
                db=db,
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="IP address temporarily blocked due to suspicious activity",
            )

        # Check account lockout
        if await security_service.is_account_locked(credentials.email):
            await security_service.log_security_event(
                "locked_account_login_attempt",
                ip_address=ip_address,
                details={"email": credentials.email},
                db=db,
            )
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account temporarily locked due to multiple failed login attempts",
            )

        # Authenticate user
        user = await user_service.authenticate_user(
            credentials.email, credentials.password, db
        )

        if not user:
            # Record failed attempt
            await security_service.record_failed_login_attempt(
                credentials.email, ip_address
            )
            await security_service.log_security_event(
                "login_failed",
                ip_address=ip_address,
                details={"email": credentials.email, "reason": "invalid_credentials"},
                db=db,
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Check if user account is active
        if not user.is_active:
            await security_service.log_security_event(
                "inactive_user_login_attempt",
                user_id=str(user.id),
                ip_address=ip_address,
                details={"email": credentials.email},
                db=db,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated"
            )

        # Generate tokens
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = jwt_service.create_access_token(token_data)
        refresh_token = jwt_service.create_refresh_token(token_data)

        # Set authentication cookies
        jwt_service.set_auth_cookies(response, access_token, refresh_token)

        # Generate and set CSRF token
        csrf_token = csrf_service.generate_csrf_token()
        csrf_service.set_csrf_cookie(response, csrf_token)

        # Create user session record
        await user_service.create_user_session(
            str(user.id), access_token, refresh_token, ip_address, user_agent, db
        )

        # Clear failed login attempts
        await security_service.clear_failed_login_attempts(credentials.email)

        # Log successful login
        await security_service.log_security_event(
            "login_success",
            user_id=str(user.id),
            ip_address=ip_address,
            details={"email": user.email},
            db=db,
        )

        # TODO: Notify MCP agents when available
        # if hasattr(request.app.state, "agent_notifier"):
        #     user_context = await user_service.create_user_context(user)
        #     asyncio.create_task(
        #         request.app.state.agent_notifier.notify_user_login(user_context)
        #     )

        return LoginResponse(
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                created_at=user.created_at,
                last_login=datetime.utcnow(),
            ),
            message="Login successful",
            csrf_token=csrf_token,
        )

    except HTTPException:
        raise
    except Exception as e:
        await security_service.log_security_event(
            "login_error",
            ip_address=ip_address,
            details={"email": credentials.email, "error": str(e)},
            db=db,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again later.",
        )


@router.post("/register", response_model=RegisterResponse)
@limiter.limit("3/minute")
async def register(
    request: Request,
    response: Response,
    credentials: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    User registration endpoint.

    Implements:
    - Email/password registration with validation
    - Rate limiting (3 attempts per minute per IP)
    - Duplicate email checking
    - Automatic login after registration
    - HttpOnly cookie setting
    - Security logging
    """
    ip_address = get_remote_address(request)
    user_agent = request.headers.get("user-agent", "")

    try:
        # Check if IP is blocked
        if await security_service.is_ip_blocked(ip_address):
            await security_service.log_security_event(
                "blocked_ip_register_attempt",
                ip_address=ip_address,
                details={"email": credentials.email},
                db=db,
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="IP address temporarily blocked due to suspicious activity",
            )

        # Create new user
        try:
            user = await user_service.create_user(
                email=credentials.email, password=credentials.password, db=db
            )
        except ValueError as e:
            # User already exists
            await security_service.log_security_event(
                "registration_failed",
                ip_address=ip_address,
                details={"email": credentials.email, "reason": "email_exists"},
                db=db,
            )
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists",
            )

        # Generate tokens for automatic login
        token_data = {"sub": str(user.id), "email": user.email}
        access_token = jwt_service.create_access_token(token_data)
        refresh_token = jwt_service.create_refresh_token(token_data)

        # Set authentication cookies
        jwt_service.set_auth_cookies(response, access_token, refresh_token)

        # Generate and set CSRF token
        csrf_token = csrf_service.generate_csrf_token()
        csrf_service.set_csrf_cookie(response, csrf_token)

        # Create user session record
        await user_service.create_user_session(
            str(user.id), access_token, refresh_token, ip_address, user_agent, db
        )

        # Log successful registration
        await security_service.log_security_event(
            "registration_success",
            user_id=str(user.id),
            ip_address=ip_address,
            details={"email": user.email},
            db=db,
        )

        # TODO: Notify MCP agents when available
        # if hasattr(request.app.state, "agent_notifier"):
        #     user_context = await user_service.create_user_context(user)
        #     asyncio.create_task(
        #         request.app.state.agent_notifier.notify_user_registration(user_context)
        #     )

        return RegisterResponse(
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                created_at=user.created_at,
                last_login=datetime.utcnow(),
            ),
            message="Registration successful",
            csrf_token=csrf_token,
        )

    except HTTPException:
        raise
    except Exception as e:
        await security_service.log_security_event(
            "registration_error",
            ip_address=ip_address,
            details={"email": credentials.email, "error": str(e)},
            db=db,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again later.",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current authenticated user information.
    Used by frontend to check authentication status.
    """
    user = await user_service.get_user_by_id(current_user["sub"], db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        created_at=user.created_at,
        last_login=user.updated_at,
    )


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    User logout endpoint.
    Clears authentication cookies and invalidates session.
    """
    user_id = current_user["sub"]
    ip_address = get_remote_address(request)

    try:
        # Get access token for session cleanup
        access_token = jwt_service.get_token_from_cookie(request, "access_token")
        if access_token:
            await user_service.invalidate_user_session(access_token, db)

        # Clear authentication cookies
        jwt_service.clear_auth_cookies(response)

        # Log logout event
        await security_service.log_security_event(
            "logout_success", user_id=user_id, ip_address=ip_address, db=db
        )

        # TODO: Notify MCP agents when available
        # if hasattr(request.app.state, "agent_notifier"):
        #     asyncio.create_task(
        #         request.app.state.agent_notifier.notify_user_logout(user_id)
        #     )

        return {"message": "Logout successful"}

    except Exception as e:
        await security_service.log_security_event(
            "logout_error",
            user_id=user_id,
            ip_address=ip_address,
            details={"error": str(e)},
            db=db,
        )
        # Still clear cookies even if logging fails
        jwt_service.clear_auth_cookies(response)
        return {"message": "Logout completed"}


@router.post("/refresh")
async def refresh_token(
    request: Request, response: Response, db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    """
    ip_address = get_remote_address(request)

    try:
        refresh_token = jwt_service.get_token_from_cookie(request, "refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found",
            )

        # Verify refresh token
        payload = jwt_service.verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
            )

        user_id = payload["sub"]
        user = await user_service.get_user_by_id(user_id, db)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        # Generate new access token
        token_data = {"sub": user_id, "email": user.email}
        new_access_token = jwt_service.create_access_token(token_data)

        # Update access token cookie
        response.set_cookie(
            key="access_token",
            value=f"Bearer {new_access_token}",
            max_age=1800,  # 30 minutes
            httponly=True,
            secure=False,  # False for development
            samesite="lax",
            path="/",
        )

        await security_service.log_security_event(
            "token_refresh_success", user_id=user_id, ip_address=ip_address, db=db
        )

        return {"message": "Token refreshed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await security_service.log_security_event(
            "token_refresh_error",
            ip_address=ip_address,
            details={"error": str(e)},
            db=db,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed",
        )
