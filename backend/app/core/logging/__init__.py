"""Logging configuration for the backend service.

This module exposes a small helper to configure Python's standard
logging for the FastAPI application. It aims to provide structured and
consistent logs that work well both locally and in production.
"""

from __future__ import annotations

import logging
from logging.config import dictConfig


def setup_logging(level: str | int = "INFO") -> None:
	"""Configure application-wide logging.

	The configuration is intentionally simple and can be evolved over time
	(e.g. adding JSON formatting, extra handlers, etc.).
	"""

	if isinstance(level, str):
		level = level.upper()

		dictConfig(
			{
				"version": 1,
				"disable_existing_loggers": False,
				"formatters": {
					"default": {
						"format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
					},
				},
				"handlers": {
					"default": {
						"class": "logging.StreamHandler",
						"formatter": "default",
					},
				},
				"loggers": {
					"uvicorn": {"handlers": ["default"], "level": level},
					"uvicorn.error": {"handlers": ["default"], "level": level},
					"uvicorn.access": {"handlers": ["default"], "level": level},
					"smart_mall": {"handlers": ["default"], "level": level},
				},
			}
		)
	else:
		logging.basicConfig(level=level)


__all__ = ["setup_logging"]
