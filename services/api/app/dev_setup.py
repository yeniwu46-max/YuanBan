"""本地开发：自动建表 + 种子数据（无需 Docker / Alembic）。"""

from pathlib import Path

from sqlalchemy import inspect

from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.models import entities  # noqa: F401
from app.seed import seed


def ensure_local_database() -> None:
    settings = get_settings()
    if settings.is_sqlite:
        db_path = settings.database_url.replace("sqlite:///", "")
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    inspector = inspect(engine)
    if not inspector.get_table_names():
        Base.metadata.create_all(bind=engine)

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
