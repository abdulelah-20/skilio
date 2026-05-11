"""
tests/test_content.py
─────────────────────
Tests for:
  - Modules list/detail
  - Lessons detail
  - Scenario engine (start, get, choose, history)
  - Invalid scenario choice rejection
  - Child progress, badges, summary, attempts
  - Child update and soft-delete
"""
import pytest


# ── Modules ───────────────────────────────────────────────────────────────────

class TestModules:
    def test_list_modules_requires_auth(self, client, seeded_content):
        r = client.get("/api/modules/")
        assert r.status_code == 401

    def test_list_modules_authenticated(self, client, seeded_content, sc_auth_headers):
        r = client.get("/api/modules/", headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        ids = [m["id"] for m in data]
        assert seeded_content["module_id"] in ids

    def test_get_module_detail(self, client, seeded_content, sc_auth_headers):
        mid = seeded_content["module_id"]
        r = client.get(f"/api/modules/{mid}", headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == mid
        assert "lessons" in data
        lesson_ids = [l["id"] for l in data["lessons"]]
        assert seeded_content["lesson_id"] in lesson_ids

    def test_get_module_not_found(self, client, sc_auth_headers):
        r = client.get("/api/modules/999999", headers=sc_auth_headers)
        assert r.status_code == 404


# ── Lessons ───────────────────────────────────────────────────────────────────

class TestLessons:
    def test_get_lesson_requires_auth(self, client, seeded_content):
        r = client.get(f"/api/lessons/{seeded_content['lesson_id']}")
        assert r.status_code == 401

    def test_get_lesson(self, client, seeded_content, sc_auth_headers):
        lid = seeded_content["lesson_id"]
        r = client.get(f"/api/lessons/{lid}", headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == lid
        assert data["entry_node_id"] == seeded_content["entry_node_id"]

    def test_get_lesson_not_found(self, client, sc_auth_headers):
        r = client.get("/api/lessons/999999", headers=sc_auth_headers)
        assert r.status_code == 404


# ── Scenario engine ───────────────────────────────────────────────────────────

class TestScenarios:
    def _start(self, client, seeded_content, sc_auth_headers, sc_child):
        r = client.post("/api/scenarios/attempts", json={
            "child_id": sc_child["id"],
            "lesson_id": seeded_content["lesson_id"],
        }, headers=sc_auth_headers)
        assert r.status_code == 201
        return r.json()

    def test_start_attempt(self, client, seeded_content, sc_auth_headers, sc_child):
        attempt = self._start(client, seeded_content, sc_auth_headers, sc_child)
        assert attempt["child_id"] == sc_child["id"]
        assert attempt["lesson_id"] == seeded_content["lesson_id"]
        assert attempt["status"] == "in_progress"
        assert attempt["current_node_id"] == seeded_content["entry_node_id"]
        assert "current_node" in attempt
        assert attempt["current_node"]["id"] == seeded_content["node_start_id"]

    def test_start_attempt_resumes_existing(self, client, seeded_content, sc_auth_headers, sc_child):
        a1 = self._start(client, seeded_content, sc_auth_headers, sc_child)
        a2 = self._start(client, seeded_content, sc_auth_headers, sc_child)
        assert a1["id"] == a2["id"]

    def test_get_attempt(self, client, seeded_content, sc_auth_headers, sc_child):
        attempt = self._start(client, seeded_content, sc_auth_headers, sc_child)
        r = client.get(f"/api/scenarios/attempts/{attempt['id']}", headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == attempt["id"]
        assert data["current_node"]["id"] == seeded_content["node_start_id"]
        choice_ids = [c["id"] for c in data["current_node"]["choices"]]
        assert seeded_content["choice_advance_id"] in choice_ids
        assert seeded_content["choice_unsafe_end_id"] in choice_ids

    def test_choose_advances_to_next_node(self, client, seeded_content, sc_auth_headers, sc_child):
        attempt = self._start(client, seeded_content, sc_auth_headers, sc_child)
        r = client.post(f"/api/scenarios/attempts/{attempt['id']}/choose", json={
            "choice_id": seeded_content["choice_advance_id"],
        }, headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["attempt"]["status"] == "in_progress"
        assert data["next_node"] is not None
        assert data["next_node"]["id"] == seeded_content["node_branch_id"]
        assert data["feedback"] == "Good thinking!"

    def test_choose_completes_scenario(self, client, seeded_content, sc_auth_headers, sc_child):
        attempt = self._start(client, seeded_content, sc_auth_headers, sc_child)
        # Choose the terminal unsafe choice (direct completion from START)
        r = client.post(f"/api/scenarios/attempts/{attempt['id']}/choose", json={
            "choice_id": seeded_content["choice_unsafe_end_id"],
        }, headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["attempt"]["status"] == "completed"
        assert data["next_node"] is None
        assert data["attempt"]["xp_earned"] > 0

    def test_choose_invalid_choice_rejected(self, client, seeded_content, sc_auth_headers, sc_child):
        attempt = self._start(client, seeded_content, sc_auth_headers, sc_child)
        # choice_safe_end_id belongs to node_branch, not node_start — should be rejected
        r = client.post(f"/api/scenarios/attempts/{attempt['id']}/choose", json={
            "choice_id": seeded_content["choice_safe_end_id"],
        }, headers=sc_auth_headers)
        assert r.status_code == 400

    def test_get_history(self, client, seeded_content, sc_auth_headers, sc_child):
        attempt = self._start(client, seeded_content, sc_auth_headers, sc_child)
        # Make one choice
        client.post(f"/api/scenarios/attempts/{attempt['id']}/choose", json={
            "choice_id": seeded_content["choice_advance_id"],
        }, headers=sc_auth_headers)
        r = client.get(f"/api/scenarios/attempts/{attempt['id']}/history", headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert len(data["choices"]) == 1
        assert data["choices"][0]["choice_id"] == seeded_content["choice_advance_id"]


# ── Progress / badges / summary ───────────────────────────────────────────────

@pytest.fixture
def child_with_completed_attempt(client, seeded_content, sc_auth_headers):
    """Returns a child who has completed exactly one scenario attempt."""
    child = client.post("/api/children/", json={
        "display_name": "ProgressKid", "age": 10,
    }, headers=sc_auth_headers).json()

    attempt = client.post("/api/scenarios/attempts", json={
        "child_id": child["id"],
        "lesson_id": seeded_content["lesson_id"],
    }, headers=sc_auth_headers).json()

    # Complete via the terminal unsafe choice
    client.post(f"/api/scenarios/attempts/{attempt['id']}/choose", json={
        "choice_id": seeded_content["choice_unsafe_end_id"],
    }, headers=sc_auth_headers)

    return child


class TestChildProgress:
    def test_child_progress(self, client, sc_auth_headers, child_with_completed_attempt):
        cid = child_with_completed_attempt["id"]
        r = client.get(f"/api/children/{cid}/progress", headers=sc_auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_child_badges(self, client, sc_auth_headers, child_with_completed_attempt):
        cid = child_with_completed_attempt["id"]
        r = client.get(f"/api/children/{cid}/badges", headers=sc_auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_child_summary(self, client, sc_auth_headers, child_with_completed_attempt):
        cid = child_with_completed_attempt["id"]
        r = client.get(f"/api/children/{cid}/summary", headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["child_id"] == cid
        assert "module_progress" in data
        assert "badges_earned" in data

    def test_child_attempts(self, client, sc_auth_headers, child_with_completed_attempt):
        cid = child_with_completed_attempt["id"]
        r = client.get(f"/api/children/{cid}/attempts", headers=sc_auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["status"] == "completed"


# ── Child management ──────────────────────────────────────────────────────────

class TestChildManagement:
    def test_update_child_name(self, client, sc_auth_headers, sc_child):
        r = client.put(
            f"/api/children/{sc_child['id']}",
            json={"display_name": "RenamedKid"},
            headers=sc_auth_headers,
        )
        assert r.status_code == 200
        assert r.json()["display_name"] == "RenamedKid"

    def test_update_child_age(self, client, sc_auth_headers, sc_child):
        r = client.put(
            f"/api/children/{sc_child['id']}",
            json={"age": 12},
            headers=sc_auth_headers,
        )
        assert r.status_code == 200
        assert r.json()["age"] == 12

    def test_soft_delete_child(self, client, sc_auth_headers, sc_child):
        r = client.delete(
            f"/api/children/{sc_child['id']}",
            headers=sc_auth_headers,
        )
        assert r.status_code == 204

    def test_deleted_child_inaccessible(self, client, sc_auth_headers, sc_child):
        client.delete(f"/api/children/{sc_child['id']}", headers=sc_auth_headers)
        r = client.get(f"/api/children/{sc_child['id']}", headers=sc_auth_headers)
        assert r.status_code == 404

    def test_other_parent_cannot_access_child(self, client, sc_auth_headers, sc_child):
        # Register a second parent
        client.post("/api/auth/register", json={
            "email": "other_parent@skilio.com",
            "full_name": "Other Parent",
            "password": "OtherPass1234!",
        })
        login = client.post("/api/auth/login", data={
            "username": "other_parent@skilio.com",
            "password": "OtherPass1234!",
        })
        assert login.status_code in (200,)
        other_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        r = client.get(f"/api/children/{sc_child['id']}", headers=other_headers)
        assert r.status_code == 404
