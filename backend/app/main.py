import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1 import admin, auth, billing, public, store_and_blog, student, trainer, jobs_and_codelab, seo
from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.services.seed_and_migrate import seed_demo_content_if_missing, seed_initial_data, seed_jobs_and_challenges_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
        await seed_jobs_and_challenges_if_empty(session)
        await seed_demo_content_if_missing(session)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description="Zero-Trust, Mobile-First Cloud LMS 2.0 Backend (FastAPI + SQLAlchemy 2.0 Async)",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(self), microphone=(), geolocation=()"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


app.include_router(auth.router, prefix="/api/v1")
app.include_router(public.router, prefix="/api/v1")
app.include_router(student.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(store_and_blog.router, prefix="/api/v1")
app.include_router(trainer.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(jobs_and_codelab.router, prefix="/api/v1")
app.include_router(seo.router)
app.include_router(seo.router, prefix="/api/v1")


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": "2.0.0",
        "security": {
            "orm_parameterized": True,
            "single_device_session": True,
            "heartbeat_verification": True,
            "signed_media_vault": True,
        },
    }


# --- Single-service frontend serving (Render) ---------------------------------
# FastAPI also serves the built React app (frontend/dist) so one Web Service
# hosts both the API and the SPA on the same origin. All /api/* routes above
# are registered first, so this catch-all only fires for unmatched paths.
# Guarded: local dev without a build (no dist dir) boots normally.
_REPO_ROOT = Path(__file__).resolve().parents[2]
_DIST_DIR = _REPO_ROOT / "frontend" / "dist"

if _DIST_DIR.is_dir():
    app.mount(
        "/assets",
        StaticFiles(directory=_DIST_DIR / "assets"),
        name="frontend-assets",
    )

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Unknown /api/* paths must 404 as JSON, never fall back to the SPA.
        if full_path == "api" or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        candidate = (_DIST_DIR / full_path).resolve()
        if candidate.is_file() and candidate.is_relative_to(_DIST_DIR.resolve()):
            return FileResponse(candidate)
        return FileResponse(_DIST_DIR / "index.html")
