"""Database package — MongoDB connection via Motor + Beanie."""

from .mongodb import close_db, init_db

__all__ = ["init_db", "close_db"]
