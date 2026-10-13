from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from models import check_blp, check_biba, BLP_LEVELS, BIBA_LEVELS

app = FastAPI(title="Access Control API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AccessRequest(BaseModel):
    model: str
    subject_level: str
    object_level: str
    operation: str
    rules: Optional[dict] = {}
    graph: Optional[dict] = {}   # <-- add this

@app.get("/")
def root():
    return {"status": "running", "models": ["blp", "biba"]}

@app.post("/check-access")
def check_access(req: AccessRequest):
    if req.model == 'blp':
        return check_blp(req.subject_level, req.object_level, req.operation, req.rules)
    elif req.model == 'biba':
        return check_biba(req.subject_level, req.object_level, req.operation, req.rules)
    return {"error": "Unknown model"}

@app.get("/levels/{model}")
def get_levels(model: str):
    return {"levels": BLP_LEVELS if model == 'blp' else BIBA_LEVELS}
