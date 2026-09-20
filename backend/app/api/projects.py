from fastapi import APIRouter, HTTPException

from app.db import get_supabase
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(project: ProjectCreate) -> ProjectResponse:
    client = get_supabase()
    result = client.table("projects").insert(project.model_dump()).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Project could not be created")
    row = result.data[0]
    return ProjectResponse(id=str(row["id"]), **{k: row.get(k) for k in project.model_fields})


@router.get("", response_model=list[ProjectResponse])
def list_projects() -> list[ProjectResponse]:
    client = get_supabase()
    result = client.table("projects").select("*").order("created_at").execute()
    return [ProjectResponse(id=str(row["id"]), **{k: row.get(k) for k in ProjectCreate.model_fields}) for row in result.data]
