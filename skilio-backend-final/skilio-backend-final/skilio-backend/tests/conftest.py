"""
tests/conftest.py
─────────────────
Shared fixtures for the test suite.
Uses an in-memory SQLite database — no external services required.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.core.dependencies import get_db
from app.main import app

TEST_DB_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture
def client(setup_db):
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """
    Clear the in-memory rate-limiter state before every test.
    Without this, the 5-req/min register limit fires mid-suite.
    """
    from app.api.auth import _rate_store
    _rate_store.clear()
    yield
    _rate_store.clear()


@pytest.fixture
def registered_user(client):
    resp = client.post("/api/auth/register", json={
        "email": "test@skilio.com",
        "full_name": "Test Parent",
        "password": "Test1234!",
    })
    # 409 means the user was already registered in a previous test in this
    # session (the in-memory DB persists across tests).  That's fine — the
    # user exists and login will work.
    assert resp.status_code in (201, 409)
    return resp.json() if resp.status_code == 201 else {"email": "test@skilio.com"}


@pytest.fixture
def auth_headers(client, registered_user):
    resp = client.post("/api/auth/login", data={
        "username": "test@skilio.com",
        "password": "Test1234!",
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── Content seed (module / lesson / scenario graph) ───────────────────────────

@pytest.fixture(scope="session")
def seeded_content(setup_db):
    """
    Seeds a minimal module/lesson/scenario tree into the test DB once per session.
    Yields a dict of IDs consumed by scenario and content test classes.
    """
    from app.models.lesson import Lesson
    from app.models.module import SkillModule
    from app.models.scenario import NodeType, ScenarioChoice, ScenarioNode

    db = TestingSessionLocal()
    try:
        module = SkillModule(
            title="_PyTestModule_",
            description="Auto-created by pytest",
            age_min=4, age_max=17,
            is_published=True, order_index=100,
        )
        db.add(module)
        db.flush()

        lesson = Lesson(
            module_id=module.id,
            title="_PyTestLesson_",
            description="Auto-created by pytest",
            xp_reward=60, order_index=1,
        )
        db.add(lesson)
        db.flush()

        n_start = ScenarioNode(
            lesson_id=lesson.id,
            content_text="Test question: which path?",
            node_type=NodeType.START,
            is_correct_path=False,
        )
        db.add(n_start)
        db.flush()

        n_branch = ScenarioNode(
            lesson_id=lesson.id,
            content_text="Follow-up question",
            node_type=NodeType.BRANCH,
            is_correct_path=True,
        )
        db.add(n_branch)
        db.flush()

        # START -> BRANCH (non-terminal, safe)
        c_advance = ScenarioChoice(
            node_id=n_start.id,
            choice_text="Safe advance choice",
            next_node_id=n_branch.id,
            is_safe_choice=True,
            feedback_text="Good thinking!",
            order_index=0,
        )
        db.add(c_advance)
        db.flush()

        # START -> terminal (unsafe)
        c_unsafe_end = ScenarioChoice(
            node_id=n_start.id,
            choice_text="Unsafe terminal choice",
            next_node_id=None,
            is_safe_choice=False,
            feedback_text="Not the best choice.",
            order_index=1,
        )
        db.add(c_unsafe_end)
        db.flush()

        # BRANCH -> terminal (safe, full XP)
        c_safe_end = ScenarioChoice(
            node_id=n_branch.id,
            choice_text="Safe terminal choice",
            next_node_id=None,
            is_safe_choice=True,
            feedback_text="Excellent!",
            order_index=0,
        )
        db.add(c_safe_end)
        db.flush()

        lesson.entry_node_id = n_start.id
        db.commit()

        yield {
            "module_id": module.id,
            "lesson_id": lesson.id,
            "entry_node_id": n_start.id,
            "node_start_id": n_start.id,
            "node_branch_id": n_branch.id,
            "choice_advance_id": c_advance.id,
            "choice_unsafe_end_id": c_unsafe_end.id,
            "choice_safe_end_id": c_safe_end.id,
        }
    finally:
        db.close()


@pytest.fixture
def sc_auth_headers(client):
    """Register + login using a dedicated account for content/scenario tests."""
    r = client.post("/api/auth/register", json={
        "email": "sc@skilio.com",
        "full_name": "SC User",
        "password": "ScUser1234!",
    })
    assert r.status_code in (201, 409)
    resp = client.post("/api/auth/login", data={
        "username": "sc@skilio.com",
        "password": "ScUser1234!",
    })
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest.fixture
def sc_child(client, sc_auth_headers):
    """Create a fresh child profile for each test that needs one."""
    resp = client.post(
        "/api/children/",
        json={"display_name": "ScKid", "age": 9},
        headers=sc_auth_headers,
    )
    assert resp.status_code == 201
    return resp.json()
