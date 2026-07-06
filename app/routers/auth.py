from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import HRUser
from app.schemas import LoginRequest, LoginResponse
from app.security import verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    hr = db.query(HRUser).filter(HRUser.email == payload.email).first()
    if hr is None or not verify_password(payload.password, hr.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="неверная почта или пароль")

    token = create_access_token(hr.id, hr.email)
    return LoginResponse(token=token, hrName=hr.name)
