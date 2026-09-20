def test_create_and_list_project(client) -> None:
    response = client.post(
        "/projects",
        json={
            "name": "G+2 Residential Building",
            "location": "Ethiopia",
            "client_name": "Test Client",
        },
    )

    assert response.status_code == 201
    project = response.json()
    assert project["name"] == "G+2 Residential Building"
    assert project["currency"] == "ETB"

    listed = client.get("/projects")
    assert listed.status_code == 200
    assert any(item["id"] == project["id"] for item in listed.json())
