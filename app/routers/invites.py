import datetime
import random
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Candidate, Invite
from app.schemas import InviteCreateRequest, InviteCreateResponse, InviteDataResponse
from app.scoring.statements import get_statements
from app.deps import get_current_hr

router = APIRouter(prefix="/api/invites", tags=["invites"])

INVITE_TTL_DAYS = 7


@router.post("", response_model=InviteCreateResponse)
def create_invite(payload: InviteCreateRequest, db: Session = Depends(get_db), hr=Depends(get_current_hr)):
    candidate = Candidate(
        name=payload.candidateName,
        email=payload.email,
        position=payload.position,
        gender=payload.gender,
        status="invited",
    )
    db.add(candidate)
    db.flush()

    token = secrets.token_hex(5)
    invite = Invite(
        token=token,
        candidate_id=candidate.id,
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=INVITE_TTL_DAYS),
    )
    db.add(invite)
    db.commit()

    link = "https://smil.fittin.ru/t/" + token
    return InviteCreateResponse(token=token, link=link)


@router.get("/{token}", response_model=InviteDataResponse)
def get_invite(token: str, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.token == token).first()
    if invite is None:
        raise HTTPException(status_code=404, detail="invalid")

    if invite.used_at is not None:
        raise HTTPException(status_code=409, detail="used")

    if invite.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=410, detail="expired")

    candidate = invite.candidate

    if invite.started_at is None:
        invite.started_at = datetime.datetime.utcnow()
        if candidate.status == "invited":
            candidate.status = "in_progress"
        db.commit()

    statements = get_statements()
    random.shuffle(statements)

    return InviteDataResponse(
        token=invite.token,
        candidateName=candidate.name,
        position=candidate.position,
        statements=statements,
    )
