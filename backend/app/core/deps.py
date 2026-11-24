from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import decode_token
from app.models.users import User

bearer_scheme = HTTPBearer(auto_error=False)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if not credentials or not credentials.credentials:
        return None
    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        return None
    try:
        user_id = int(payload.get("sub", 0))
    except (ValueError, TypeError):
        return None
    if not user_id:
        return None

    stmt = select(User).options(selectinload(User.profile)).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        return None

    # Enforce Single-Device Session Guard
    token_sid = payload.get("sid", "")
    if user.profile and user.profile.current_session_key and token_sid:
        if user.profile.current_session_key != token_sid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired because your account was signed in on another device.",
            )
    return user


async def get_current_user(
    user: Optional[User] = Depends(get_optional_user),
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
        )
    return user


async def require_trainer(
    user: User = Depends(get_current_user),
) -> User:
    is_trainer = bool(user.profile and user.profile.is_trainer)
    if not (is_trainer or user.is_staff or user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Trainer or Admin privileges required.",
        )
    return user


async def require_admin(
    user: User = Depends(get_current_user),
) -> User:
    if not (user.is_staff or user.is_superuser):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Executive Admin privileges required.",
        )
    return user
