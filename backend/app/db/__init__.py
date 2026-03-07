"""Database package — MongoDB connection via Motor + Beanie."""

from .mongodb import init_db, close_db

__all__ = ["init_db", "close_db"]
