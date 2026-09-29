from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.errors import install_error_handlers
from app.db import Base, engine
from app.models import User, Policy, PatientDetails, PolicyAnalysis, AnalysisAdditionalInformation
from app.api import auth, users, policies, assistant, cost, coverage, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="PolicyWise Backend API", version="1.0.0", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if settings.frontend_url:
    origins.append(settings.frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
install_error_handlers(app)
for router in [auth.router, users.router, policies.router, assistant.router, cost.router, coverage.router, reports.router]:
    app.include_router(router)

@app.get("/health")
def health():
    return {"status": "ok"}


