from typing import List, Optional
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    hrName: str


class InviteCreateRequest(BaseModel):
    candidateName: str
    email: str
    position: str
    gender: str


class InviteCreateResponse(BaseModel):
    token: str
    link: str


class StatementOut(BaseModel):
    id: int
    text: str


class InviteDataResponse(BaseModel):
    token: str
    candidateName: str
    position: str
    statements: List[StatementOut]


class AnswerIn(BaseModel):
    statementId: int
    value: str


class SubmitPayload(BaseModel):
    answers: List[AnswerIn]


class SubmitResponse(BaseModel):
    ok: bool
