from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://fittin:fittin@localhost:5432/fittin"
    jwt_secret: str = "super-secret-key-change-me"
    jwt_expire_minutes: int = 720
    jwt_algorithm: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()
