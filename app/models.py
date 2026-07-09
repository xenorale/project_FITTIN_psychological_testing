import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class HRUser(Base):
    __tablename__ = "hr_users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    position = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    status = Column(String, nullable=False, default="invited")
    invited_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    duration_min = Column(Integer, nullable=True)

    invites = relationship("Invite", back_populates="candidate")
    answers = relationship("Answer", back_populates="candidate")
    result = relationship("Result", back_populates="candidate", uselist=False)


class Invite(Base):
    __tablename__ = "invites"

    id = Column(Integer, primary_key=True)
    token = Column(String, unique=True, nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)

    candidate = relationship("Candidate", back_populates="invites")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    statement_id = Column(Integer, nullable=False)
    value = Column(Boolean, nullable=False)

    candidate = relationship("Candidate", back_populates="answers")


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), unique=True, nullable=False)
    raw = Column(JSON, nullable=False)
    profile = Column(JSON, nullable=False)
    validity = Column(String, nullable=False)
    computed_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="result")
