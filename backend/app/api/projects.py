from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.db import get_supabase
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])


def _to_response(row: dict) -> ProjectResponse:
    return ProjectResponse(
        id=str(row["id"]),
        name=row["name"],
        location=row.get("location"),
        client_name=row.get("client_name"),
        description=row.get("description"),
        currency=row.get("currency") or "ETB",
    )


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(project: ProjectCreate) -> ProjectResponse:
    client = get_supabase()
    result = client.table("projects").insert(project.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Project could not be created")
    return _to_response(result.data[0])


@router.get("", response_model=list[ProjectResponse])
def list_projects() -> list[ProjectResponse]:
    client = get_supabase()
    result = client.table("projects").select("*").order("created_at", desc=True).execute()
    return [_to_response(row) for row in result.data]


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str) -> ProjectResponse:
    client = get_supabase()
    result = client.table("projects").select("*").eq("id", project_id).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return _to_response(result.data[0])


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, project: ProjectCreate) -> ProjectResponse:
    client = get_supabase()
    payload = {
        **project.model_dump(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    result = client.table("projects").update(payload).eq("id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return _to_response(result.data[0])


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str) -> None:
    client = get_supabase()
    result = client.table("projects").delete().eq("id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
