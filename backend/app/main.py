import logging
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.core.rate_limiter import rate_limiter
from app.api.v1.router import api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("kallipolis.backend")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Autonomous Security, Intelligence, & Threat Prevention Platform for Polygon Ecosystem",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate Limiter Middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    allowed, remaining = await rate_limiter.check_rate_limit(client_ip)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Kallipolis ZK Rate Limit Exceeded. Token Bucket empty."
        )
    response = await call_next(request)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response

# Include V1 API Routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def on_startup():
    logger.info("Initializing Kallipolis ZK v3.0 Backend Services...")
    await init_db()
    logger.info("Kallipolis ZK v3.0 Backend initialized successfully.")

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": "3.0.0",
        "docs": "/docs",
        "status": "ONLINE"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
