"""Application configuration.

Centralises runtime configuration using ``pydantic-settings`` so every
tunable is read from environment variables (or a ``.env`` file) with
sensible defaults for local development.

Usage::

    from app.core.config import get_settings
    settings = get_settings()
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


_ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
	model_config = SettingsConfigDict(
		env_file=str(_ENV_FILE) if _ENV_FILE.exists() else None,
		env_file_encoding="utf-8",
		case_sensitive=False,
		extra="ignore",
	)

	# General
	project_name: str = "Smart Mall Management System API"
	app_version: str = "0.1.0"
	app_env: str = "development"
	app_debug: bool = True

	# API
	api_prefix: str = "/api/v1"

	# Security / JWT
	secret_key: str = "change-me-to-a-random-secret"
	jwt_algorithm: str = "HS256"
	jwt_access_token_expire_minutes: int = 60

	# MongoDB
	mongodb_url: str = "mongodb://localhost:27017"
	mongodb_db_name: str = "smart_mall"

	# CORS
	backend_cors_origins: List[str] = []

	@field_validator("backend_cors_origins", mode="before")
	@classmethod
	def assemble_cors_origins(cls, value: object) -> List[str]:
		if isinstance(value, str):
			return [o.strip() for o in value.split(",") if o.strip()]
		if isinstance(value, list):
			return value
		return []

	# Convenience properties
	@property
	def version(self) -> str:
		return self.app_version

	@property
	def environment(self) -> str:
		return self.app_env

	@property
	def debug(self) -> bool:
		return self.app_debug

	@property
	def is_production(self) -> bool:
		return self.app_env.lower() == "production"


@lru_cache
def get_settings() -> Settings:
	"""Return the cached :class:`Settings` instance."""
	return Settings()


__all__ = ["Settings", "get_settings"]

