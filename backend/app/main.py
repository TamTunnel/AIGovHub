from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import create_db_and_tables
from .api import routes
from .api import auth_routes
from .api import report_routes
from .api import policy_routes
from .api import organization_routes
from .api import metrics_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="AI Governance Hub API",
    description="API for AI Model Governance & Compliance - v0.3 with Policy Engine",
    version="0.3.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core API routes
app.include_router(routes.router, prefix="/api/v1")

# Authentication routes
app.include_router(auth_routes.router, prefix="/api/v1")

# Compliance report routes
app.include_router(report_routes.router, prefix="/api/v1")

# Policy engine routes
app.include_router(policy_routes.router, prefix="/api/v1")

# Organization routes
app.include_router(organization_routes.router, prefix="/api/v1")

# Metrics routes (Prometheus-compatible)
app.include_router(metrics_routes.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Governance Hub API v0.3"}



