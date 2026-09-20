from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_boq_crud() -> None:
    project_id = "test-project-boq"

    created = client.post(
        f"/projects/{project_id}/boq",
        json={
            "item_no": 1,
            "description": "Excavation",
            "unit": "m3",
            "quantity": 10,
            "unit_rate": 1000,
        },
    )
    assert created.status_code == 201
    item = created.json()
    assert item["amount"] == "10000.00"

    listed = client.get(f"/projects/{project_id}/boq")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.put(
        f"/projects/{project_id}/boq/{item['id']}",
        json={
            "item_no": 1,
            "description": "Excavation and disposal",
            "unit": "m3",
            "quantity": 12,
            "unit_rate": 1000,
        },
    )
    assert updated.status_code == 200
    assert updated.json()["amount"] == "12000.00"

    deleted = client.delete(f"/projects/{project_id}/boq/{item['id']}")
    assert deleted.status_code == 204

    assert client.get(f"/projects/{project_id}/boq").json() == []
