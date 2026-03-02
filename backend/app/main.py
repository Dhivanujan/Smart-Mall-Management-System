"""FastAPI application entrypoint.

This module exposes the FastAPI ``app`` instance used by ASGI servers
like Uvicorn or Hypercorn.
"""

from fastapi import FastAPI

from .api.v1 import admin, auth


def create_app() -> FastAPI:
	"""Application factory.

	Registers core routers and health checks. As the layered architecture
	expands (domain, application, etc.), their routers can be mounted here.
	"""

	app = FastAPI(title="Smart Mall Management System API", version="0.1.0")

	@app.get("/health", tags=["health"])
	async def health() -> dict[str, str]:
		return {"status": "ok"}

	@app.get("/", tags=["root"])
	async def root() -> dict[str, str]:
		return {"message": "Smart Mall Management System API"}

	# API v1 routers
	app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
	app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])

	return app


app = create_app()

