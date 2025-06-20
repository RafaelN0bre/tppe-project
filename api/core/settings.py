from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    dbserver_database: str
    dbserver_url: str
    dbserver_cert_base64: str

    algorithm: str = "HS256"
    logging_level: str = "INFO"
    access_token_expire_minutes: int = 300
    refresh_token_expire_days: int = 7
    secret_key: str = "1b50e62f1cf969bf36d02f1b5f82be0524889c5a46dc491cd4922cee68e5d90c"

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

settings = Settings()
