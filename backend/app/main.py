"""FastAPI application entrypoint."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from starlette import status

from .api.v1 import admin, auth, stores, queues
from .core.config import get_settings
from .core.logging import setup_logging
from .websocket.routes import queues_router


logger = logging.getLogger("smart_mall.app")


def _custom_generate_unique_id(route: APIRoute) -> str:
	return f"{route.tags[0]}-{route.name}" if route.tags else route.name or "unknown"


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncIterator[None]:
	settings = get_settings()
	logger.info("Starting Smart Mall backend", extra={"env": settings.environment})
	yield
	logger.info("Shutting down Smart Mall backend")


def create_app() -> FastAPI:
	"""Application factory."""

	settings = get_settings()
	setup_logging("DEBUG" if settings.debug else "INFO")

	app = FastAPI(
		title=settings.project_name,
		version=settings.version,
		lifespan=_lifespan,
		generate_unique_id_function=_custom_generate_unique_id,
	)

	# CORS
	if settings.backend_cors_origins:
		app.add_middleware(
			CORSMiddleware,
			allow_origins=[str(origin) for origin in settings.backend_cors_origins],
			allow_credentials=True,
			allow_methods=["*"],
			allow_headers=["*"],
		)

	# Health endpoints
	@app.get("/health", tags=["health"])
	async def health() -> Dict[str, str]:
		return {"status": "ok"}

	@app.get("/health/ready", tags=["health"])
	async def readiness() -> Dict[str, str]:
		return {"status": "ready"}

	@app.get("/", tags=["root"])
	async def root() -> Dict[str, str]:
		return {"message": settings.project_name}

	# API v1 routers
	app.include_router(auth.router, prefix=f"{settings.api_prefix}/auth", tags=["auth"])
	app.include_router(admin.router, prefix=f"{settings.api_prefix}/admin", tags=["admin"])
	app.include_router(stores.router, prefix=f"{settings.api_prefix}/stores", tags=["stores"])
	app.include_router(queues.router, prefix=f"{settings.api_prefix}", tags=["queues"])

	# WebSocket routes
	app.include_router(queues_router)

	# Global error handlers
	@app.exception_handler(RequestValidationError)
	async def validation_exception_handler(
		request: Request, exc: RequestValidationError
	) -> JSONResponse:
		logger.warning(
			"Validation error", extra={"path": str(request.url), "errors": exc.errors()}
		)
		return JSONResponse(
			status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
			content={
				"detail": "Request validation failed",
				"errors": exc.errors(),
			},
		)

	@app.exception_handler(Exception)
	async def unhandled_exception_handler(
		request: Request, exc: Exception
	) -> JSONResponse:
		logger.exception("Unhandled error", extra={"path": str(request.url)})
		return JSONResponse(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			content={"detail": "Internal server error"},
		)

	return app


app = create_app()

