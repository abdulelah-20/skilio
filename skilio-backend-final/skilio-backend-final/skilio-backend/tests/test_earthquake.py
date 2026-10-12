from scripts.seed import seed_earthquake
from app.models.module import SkillModule
from app.models.lesson import Lesson


def test_earthquake_retries_then_awards_xp_once(client, db, sc_auth_headers, sc_child):
    seed_earthquake(db)
    db.commit()
    module = db.query(SkillModule).filter_by(title="Earthquake World").one()
    lesson = db.query(Lesson).filter_by(module_id=module.id).one()
    response = client.post("/api/scenarios/attempts", headers=sc_auth_headers,
                           json={"child_id": sc_child["id"], "lesson_id": lesson.id})
    assert response.status_code == 201
    state = response.json()
    node = state["current_node"]
    choices = sorted(node["choices"], key=lambda choice: choice["order_index"])
    assert len(choices) == 4
    assert choices[0]["is_safe_choice"] is True
    endpoint = f"/api/scenarios/attempts/{state['id']}/choose"
    for choice in choices[1:]:
        result = client.post(endpoint, headers=sc_auth_headers, json={"choice_id": choice["id"]})
        assert result.status_code == 200
        data = result.json()
        assert data["attempt"]["status"] == "in_progress"
        assert data["attempt"]["xp_earned"] == 0
        assert data["next_node"]["id"] == node["id"]
        assert data["feedback"]
    result = client.post(endpoint, headers=sc_auth_headers, json={"choice_id": choices[0]["id"]})
    assert result.status_code == 200
    assert result.json()["attempt"]["status"] == "completed"
    assert result.json()["attempt"]["xp_earned"] == 40
    assert "protect your head" in result.json()["feedback"]
    repeated = client.post(endpoint, headers=sc_auth_headers, json={"choice_id": choices[0]["id"]})
    assert repeated.status_code != 200
