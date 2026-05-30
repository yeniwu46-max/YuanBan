"""本地开发：自动建表 + 种子数据（无需 Docker / Alembic）。"""

from pathlib import Path

from sqlalchemy import inspect, text

from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.models import entities  # noqa: F401
from app.seed import seed


def _ensure_sqlite_columns() -> None:
    settings = get_settings()
    if not settings.is_sqlite:
        return
    with engine.connect() as conn:
        cols = {row[1] for row in conn.execute(text("PRAGMA table_info(users)"))}
        if cols and "wechat_openid" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN wechat_openid VARCHAR(128)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(512)"))
            conn.execute(text("ALTER TABLE users ADD COLUMN community_site_id VARCHAR(64)"))
            conn.commit()


def ensure_local_database() -> None:
    settings = get_settings()
    if settings.is_sqlite:
        db_path = settings.database_url.replace("sqlite:///", "")
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_columns()

    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


def main() -> None:
    ensure_local_database()
    print("Local database ready (tables + seed)")


if __name__ == "__main__":
    main()
