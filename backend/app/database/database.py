from sqlmodel import SQLModel, Session, create_engine
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import asyncio

from app.config import settings


engine = None


def get_engine():
    global engine
    if engine is None:
        connect_args = {"check_same_thread": False}
        engine = create_engine(
            f"sqlite:///{settings.sqlite_path}",
            connect_args=connect_args,
            echo=settings.app_env == "development",
        )
    return engine


def init_db():
    engine = get_engine()
    SQLModel.metadata.create_all(engine)


def close_db():
    global engine
    if engine:
        engine.dispose()
        engine = None


def get_session() -> Session:
    engine = get_engine()
    return Session(engine)


@asynccontextmanager
async def get_async_session() -> AsyncGenerator[Session, None]:
    session = get_session()
    try:
        yield session
    finally:
        session.close()