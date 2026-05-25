from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # 本地无 Docker：默认 SQLite 单文件库
    database_url: str = "sqlite:///./data/yuanbanban.db"
    redis_url: str = "redis://localhost:6379/0"
    redis_enabled: bool = False
    mqtt_host: str = "localhost"
    mqtt_port: int = 1883
    mqtt_topic_prefix: str = "yuanbanban"
    mqtt_enabled: bool = False
    sos_dedup_seconds: int = 300
    run_seed: bool = False

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()
