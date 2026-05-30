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
    ai_provider: str = "dashscope"
    ai_model: str = "qwen-plus-latest"
    ai_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    dashscope_api_key: str = ""
    sos_dedup_seconds: int = 300
    run_seed: bool = False

    # 认证
    jwt_secret: str = "yuanbanban-dev-secret-change-in-production"
    jwt_expire_hours: int = 168
    auth_dev_bypass: bool = True
    dev_otp_code: str = "123456"
    wechat_app_id: str = ""
    wechat_app_secret: str = ""
    simulator_enabled: bool = True

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()
