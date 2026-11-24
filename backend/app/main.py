from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import admin, auth, billing, public, store_and_blog, student, trainer, jobs_and_codelab, seo
from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine
from app.services.seed_and_migrate import seed_initial_data, seed_jobs_and_challenges_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
        await seed_jobs_and_challenges_if_empty(session)
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
