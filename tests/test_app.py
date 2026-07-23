from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities_returns_all_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "Programming Class" in data
    assert "Gym Class" in data


def test_signup_for_activity_adds_participant():
    activity_name = "Chess Club"
    email = "testuser@example.com"

    response = client.post(f"/activities/{activity_name}/signup", params={"email": email})
    assert response.status_code == 200
    assert response.json()["message"] == f"Signed up {email} for {activity_name}"

    get_response = client.get("/activities")
    assert email in get_response.json()[activity_name]["participants"]


def test_remove_participant_from_activity():
    activity_name = "Programming Class"
    email = "remove-test@example.com"

    signup_response = client.post(
        f"/activities/{activity_name}/signup", params={"email": email}
    )
    assert signup_response.status_code == 200

    delete_response = client.delete(
        f"/activities/{activity_name}/participants", params={"email": email}
    )
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == f"Removed {email} from {activity_name}"

    get_response = client.get("/activities")
    assert email not in get_response.json()[activity_name]["participants"]


def test_delete_nonexistent_participant_returns_404():
    activity_name = "Gym Class"
    email = "noone@example.com"

    response = client.delete(
        f"/activities/{activity_name}/participants", params={"email": email}
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Participant not found"
