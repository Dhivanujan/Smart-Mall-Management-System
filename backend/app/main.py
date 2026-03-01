"""FastAPI application entrypoint.

This module exposes the FastAPI ``app`` instance used by ASGI servers
like Uvicorn or Hypercorn.
"""

from fastapi import FastAPI


def create_app() -> FastAPI:
	"""Application factory.

	For now this only registers a simple health check endpoint.
	Routers for the rest of the layered architecture (api, domain,
	application, etc.) can be mounted here as they are implemented.
	"""

	app = FastAPI(title="Smart Mall Management System API", version="0.1.0")

	@app.get("/health", tags=["health"])
	async def health() -> dict[str, str]:
		return {"status": "ok"}

	@app.get("/", tags=["root"])
	async def root() -> dict[str, str]:
		return {"message": "Smart Mall Management System API"}

	return app


app = create_app()

