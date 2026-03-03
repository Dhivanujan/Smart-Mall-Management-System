"""Application configuration.

This module centralises runtime configuration for the backend. It uses
environment variables with sensible defaults so that the application can
run locally without extra setup, while still being configurable in
staging/production.

The goal is to avoid scattering ``os.getenv`` calls throughout the code
base. Instead, import and use :func:`get_settings` wherever configuration
is required.
"""

from __future__ import annotations

from functools import lru_cache
import os
from typing import List

from pydantic import AnyHttpUrl, BaseModel, field_validator


class Settings(BaseModel):

	"""Runtime application settings.

	The fields here are intentionally small to start with; more can be
	added as the project grows (database URLs, cache settings, etc.).
	"""

	# General
	project_name: str = "Smart Mall Management System API"
	version: str = os.getenv("APP_VERSION", "0.1.0")
	environment: str = os.getenv("APP_ENV", "development")
	debug: bool = os.getenv("APP_DEBUG", "true").lower() == "true"

	# API
	api_prefix: str = "/api/v1"

	# CORS
	backend_cors_origins: List[AnyHttpUrl] | List[str] = []

	@field_validator("backend_cors_origins", mode="before")
	@classmethod
	def assemble_cors_origins(cls, value: object) -> List[AnyHttpUrl] | List[str]:
		"""Parse ``BACKEND_CORS_ORIGINS`` from the environment.

		Supports both a comma separated string or a JSON-style list.
		"""

		if value is not None and value != "":
			return value  # Already provided explicitly

		env_value = os.getenv("BACKEND_CORS_ORIGINS", "")
		if not env_value:
			return []

		# Allow comma separated values e.g. "http://localhost:3000,https://app.example.com"
		origins = [origin.strip() for origin in env_value.split(",") if origin.strip()]
		return origins

	@property
	def is_production(self) -> bool:
		return self.environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
	"""Return the cached :class:`Settings` instance.

	Using :func:`lru_cache` ensures configuration is loaded once per process
	in a thread-safe way.
	"""

	return Settings()


__all__ = ["Settings", "get_settings"]

