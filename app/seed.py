import datetime
import secrets

from app.database import SessionLocal
from app.models import HRUser, Candidate, Invite, Result
from app.security import hash_password

CANDIDATES = [
    dict(name="Алина Ковалёва", email="a.kovaleva@mail.ru", position="Продуктовый аналитик", status="completed",
         gender="f", invited_at="2026-06-24", completed_at="2026-06-25", duration_min=47, validity="valid",
         profile={"L": 48, "F": 55, "K": 52, "1": 58, "2": 71, "3": 62, "4": 49, "5": 44, "6": 54, "7": 74, "8": 60, "9": 45, "0": 63},
         raw={"L": 4, "F": 9, "K": 14, "1": 16, "2": 27, "3": 24, "4": 20, "5": 30, "6": 11, "7": 32, "8": 29, "9": 18, "0": 34}),
    dict(name="Дмитрий Соколов", email="sokolov.d@gmail.com", position="Frontend-разработчик", status="completed",
         gender="m", invited_at="2026-06-24", completed_at="2026-06-24", duration_min=39, validity="valid",
         profile={"L": 44, "F": 51, "K": 58, "1": 46, "2": 48, "3": 50, "4": 66, "5": 53, "6": 49, "7": 42, "8": 55, "9": 73, "0": 40},
         raw={"L": 3, "F": 7, "K": 18, "1": 11, "2": 18, "3": 20, "4": 26, "5": 26, "6": 9, "7": 19, "8": 26, "9": 24, "0": 22}),
    dict(name="Марина Егорова", email="marina.egorova@yandex.ru", position="HR-менеджер", status="completed",
         gender="f", invited_at="2026-06-23", completed_at="2026-06-23", duration_min=54, validity="doubtful",
         profile={"L": 66, "F": 43, "K": 71, "1": 52, "2": 47, "3": 61, "4": 44, "5": 48, "6": 46, "7": 45, "8": 43, "9": 58, "0": 41},
         raw={"L": 8, "F": 5, "K": 22, "1": 14, "2": 17, "3": 23, "4": 18, "5": 28, "6": 8, "7": 21, "8": 20, "9": 20, "0": 23}),
    dict(name="Артём Лебедев", email="artem.lebedev@outlook.com", position="Backend-разработчик", status="completed",
         gender="m", invited_at="2026-06-22", completed_at="2026-06-23", duration_min=61, validity="valid",
         profile={"L": 50, "F": 62, "K": 47, "1": 63, "2": 59, "3": 55, "4": 72, "5": 58, "6": 76, "7": 64, "8": 69, "9": 61, "0": 53},
         raw={"L": 5, "F": 12, "K": 12, "1": 18, "2": 22, "3": 22, "4": 28, "5": 29, "6": 15, "7": 28, "8": 33, "9": 21, "0": 29}),
    dict(name="Екатерина Волкова", email="e.volkova@mail.ru", position="Продуктовый аналитик", status="in_progress",
         gender="f", invited_at="2026-07-03", completed_at=None, duration_min=None, validity=None,
         profile=None, raw=None, token="4c1d7b9e33"),
    dict(name="Никита Морозов", email="nikita.morozov@gmail.com", position="Frontend-разработчик", status="in_progress",
         gender="m", invited_at="2026-07-04", completed_at=None, duration_min=None, validity=None,
         profile=None, raw=None),
    dict(name="Полина Новикова", email="polina.n@yandex.ru", position="UX-дизайнер", status="invited",
         gender="f", invited_at="2026-07-04", completed_at=None, duration_min=None, validity=None,
         profile=None, raw=None, token="a7f3c9d1e2"),
    dict(name="Сергей Кузнецов", email="kuznetsov.serg@mail.ru", position="Backend-разработчик", status="invited",
         gender="m", invited_at="2026-07-05", completed_at=None, duration_min=None, validity=None,
         profile=None, raw=None, token="b2e8f4a0c6"),
    dict(name="Ольга Смирнова", email="olga.smirnova@gmail.com", position="HR-менеджер", status="expired",
         gender="f", invited_at="2026-06-18", completed_at=None, duration_min=None, validity=None,
         profile=None, raw=None),
    dict(name="Роман Павлов", email="roman.pavlov@outlook.com", position="Продуктовый аналитик", status="completed",
         gender="m", invited_at="2026-06-20", completed_at="2026-06-21", duration_min=44, validity="valid",
         profile={"L": 46, "F": 49, "K": 55, "1": 51, "2": 44, "3": 53, "4": 57, "5": 50, "6": 52, "7": 48, "8": 47, "9": 62, "0": 46},
         raw={"L": 4, "F": 6, "K": 17, "1": 13, "2": 16, "3": 21, "4": 23, "5": 27, "6": 10, "7": 22, "8": 22, "9": 22, "0": 25}),
    dict(name="Тест Тестович", email="test@test.ru", position="Frontend-разработчик", status="completed",
         gender="m", invited_at="2026-07-01", completed_at="2026-07-01", duration_min=3, validity="doubtful",
         profile={"L": 52, "F": 98, "K": 43, "1": 84, "2": 89, "3": 78, "4": 86, "5": 61, "6": 91, "7": 88, "8": 94, "9": 76, "0": 72},
         raw={"L": 6, "F": 26, "K": 11, "1": 24, "2": 33, "3": 31, "4": 32, "5": 30, "6": 18, "7": 38, "8": 41, "9": 26, "0": 40}),
    dict(name="ааа ббб", email="asdf@asdf.ru", position="Frontend-разработчик", status="in_progress",
         gender="m", invited_at="2026-07-05", completed_at=None, duration_min=None, validity=None,
         profile=None, raw=None, token="qwerty1234"),
    dict(name="Проверка Связи", email="test123@test.ru", position="QA-инженер", status="invited",
         gender="f", invited_at="2026-07-05", completed_at=None, duration_min=None, validity=None,
         profile=None, raw=None, token="test0000zz"),
    dict(name="Иван Петров", email="IvanPetrov1998@MAIL.RU", position="Backend-разработчик", status="completed",
         gender="m", invited_at="2026-06-28", completed_at="2026-06-29", duration_min=51, validity="valid",
         profile={"L": 49, "F": 53, "K": 50, "1": 55, "2": 52, "3": 57, "4": 61, "5": 47, "6": 58, "7": 56, "8": 54, "9": 66, "0": 49},
         raw={"L": 4, "F": 8, "K": 15, "1": 15, "2": 20, "3": 22, "4": 24, "5": 26, "6": 12, "7": 25, "8": 25, "9": 23, "0": 26}),
]


def parse_date(value):
    if value is None:
        return None
    return datetime.datetime.strptime(value, "%Y-%m-%d")


def run():
    db = SessionLocal()

    if db.query(HRUser).filter(HRUser.email == "hr@fittin.ru").first() is None:
        db.add(HRUser(email="hr@fittin.ru", password_hash=hash_password("fittin2026"), name="Ирина Соловьёва"))

    for item in CANDIDATES:
        existing = db.query(Candidate).filter(Candidate.email == item["email"]).first()
        if existing is not None:
            continue

        candidate = Candidate(
            name=item["name"],
            email=item["email"],
            position=item["position"],
            gender=item["gender"],
            status=item["status"],
            invited_at=parse_date(item["invited_at"]),
            completed_at=parse_date(item["completed_at"]),
            duration_min=item["duration_min"],
        )
        db.add(candidate)
        db.flush()

        if item["profile"] is not None:
            db.add(Result(
                candidate_id=candidate.id,
                raw=item["raw"],
                profile=item["profile"],
                validity=item["validity"],
                computed_at=candidate.completed_at,
            ))

        token = item.get("token", secrets.token_hex(5))
        expires_at = (candidate.invited_at or datetime.datetime.utcnow()) + datetime.timedelta(days=7)

        invite = Invite(token=token, candidate_id=candidate.id, created_at=candidate.invited_at, expires_at=expires_at)

        if item["status"] == "completed":
            invite.started_at = candidate.invited_at
            invite.used_at = candidate.completed_at
        elif item["status"] == "in_progress":
            invite.started_at = candidate.invited_at
        elif item["status"] == "expired":
            invite.expires_at = candidate.invited_at + datetime.timedelta(days=3)

        db.add(invite)

    db.commit()
    db.close()


if __name__ == "__main__":
    run()
