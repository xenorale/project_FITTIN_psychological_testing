from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Candidate, Answer
from app.schemas import CandidateOut
from app.scoring.statements import STATEMENTS
from app.scoring.scales import SCALES, CLINICAL_SCALES, INTERPRETATIONS
from app.pdf.render import render_candidate_pdf
from app.deps import get_current_hr

router = APIRouter(prefix="/api/candidates", tags=["candidates"])

TOTAL_STATEMENTS = len(STATEMENTS)


def to_out(candidate: Candidate, db: Session) -> CandidateOut:
    answers_done = db.query(Answer).filter(Answer.candidate_id == candidate.id).count()

    result = candidate.result
    profile = result.profile if result else None
    raw = result.raw if result else None
    validity = result.validity if result else None
    interpretation = build_interpretation(profile) if profile else None

    return CandidateOut(
        id="c-" + str(candidate.id),
        name=candidate.name,
        email=candidate.email,
        position=candidate.position,
        status=candidate.status,
        gender=candidate.gender,
        invitedAt=candidate.invited_at.strftime("%Y-%m-%d") if candidate.invited_at else None,
        completedAt=candidate.completed_at.strftime("%Y-%m-%d") if candidate.completed_at else None,
        durationMin=candidate.duration_min,
        validity=validity,
        answersDone=answers_done,
        answersTotal=TOTAL_STATEMENTS,
        profile=profile,
        raw=raw,
        interpretation=interpretation,
    )


def build_interpretation(profile):
    scale_by_code = {s["code"]: s for s in SCALES}
    peaks = [code for code in CLINICAL_SCALES if profile.get(code, 0) >= 70]
    peaks.sort(key=lambda code: profile[code], reverse=True)
    return [
        {
            "code": code,
            "name": scale_by_code[code]["name"],
            "t": profile[code],
            "text": INTERPRETATIONS[code],
        }
        for code in peaks
    ]


def parse_id(raw_id: str) -> int:
    text = raw_id[2:] if raw_id.startswith("c-") else raw_id
    if not text.isdigit():
        raise HTTPException(status_code=404, detail="not found")
    return int(text)


@router.get("", response_model=List[CandidateOut])
def list_candidates(db: Session = Depends(get_db), hr=Depends(get_current_hr)):
    candidates = db.query(Candidate).order_by(Candidate.invited_at.desc()).all()
    return [to_out(c, db) for c in candidates]


@router.get("/{candidate_id}", response_model=CandidateOut)
def get_candidate(candidate_id: str, db: Session = Depends(get_db), hr=Depends(get_current_hr)):
    cid = parse_id(candidate_id)
    candidate = db.query(Candidate).filter(Candidate.id == cid).first()
    if candidate is None:
        raise HTTPException(status_code=404, detail="not found")
    return to_out(candidate, db)


@router.get("/{candidate_id}/pdf")
def get_candidate_pdf(candidate_id: str, db: Session = Depends(get_db), hr=Depends(get_current_hr)):
    cid = parse_id(candidate_id)
    candidate = db.query(Candidate).filter(Candidate.id == cid).first()
    if candidate is None or candidate.result is None:
        raise HTTPException(status_code=404, detail="not found")

    candidate_out = to_out(candidate, db)
    pdf_bytes = render_candidate_pdf(candidate_out)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="candidate-{}.pdf"'.format(cid)},
    )
