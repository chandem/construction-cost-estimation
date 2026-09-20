from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1)
    location: str | None = None
    client_name: str | None = None
    description: str | None = None
    currency: str = Field(default="ETB", min_length=3, max_length=3)


class ProjectResponse(ProjectCreate):
    id: str
