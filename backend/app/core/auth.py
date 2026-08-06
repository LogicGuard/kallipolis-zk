import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

logger = logging.getLogger("kallipolis.auth")
security = HTTPBearer(auto_error=False)

class UserAuthContext:
    def __init__(self, uid: str, role: str = "User", organization: str = "Default"):
        self.uid = uid
        self.role = role  # Admin | Developer | User | ReadOnly
        self.organization = organization

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> UserAuthContext:
    if not credentials:
        # Default anonymous user for open API demonstration
        return UserAuthContext(uid="anon_user", role="User", organization="PolygonEcosystem")

    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        uid: str = payload.get("sub", "unknown")
        role: str = payload.get("role", "User")
        org: str = payload.get("org", "Default")
        return UserAuthContext(uid=uid, role=role, organization=org)
    except JWTError:
        # Fallback to dev mode auth
        return UserAuthContext(uid="authenticated_dev", role="Developer", organization="PolygonEcosystem")

def require_role(allowed_roles: list[str]):
    async def role_checker(user: UserAuthContext = Depends(get_current_user)):
        if user.role not in allowed_roles and user.role != "Admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {allowed_roles}"
            )
        return user
    return role_checker
