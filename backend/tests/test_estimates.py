from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_calculate_estimate() -> None:
    response = client.post(
        "/estimates/calculate",
        json={
            "items": [
                {
                    "description": "Excavation",
                    "quantity": 10,
                    "unit": "m3",
                    "unit_rate": 1000,
                },
                {
                    "description": "Concrete",
                    "quantity": 5,
                    "unit": "m3",
                    "unit_rate": 6000,
                },
            ],
            "overhead_percent": 10,
            "profit_percent": 5,
            "contingency_percent": 3,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["subtotal"] == "40000"
    assert data["overhead"] == "4000"
    assert data["profit"] == "2200"
    assert data["contingency"] == "1386"
    assert data["total"] == "47586"
