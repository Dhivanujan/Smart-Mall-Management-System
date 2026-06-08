"""Beanie document models for MongoDB collections."""

from .complaint import ComplaintDocument
from .event_reminder import EventReminderDocument
from .favorite import FavoriteDocument
from .lost_report import LostReportDocument
from .loyalty import LoyaltyAccountDocument
from .movie_booking import MovieBookingDocument
from .notification import NotificationDocument
from .offer import OfferDocument
from .parking import ParkingSlotDocument
from .queue import QueueDocument
from .store import ProductDocument, StoreDocument
from .user import UserDocument

ALL_DOCUMENT_MODELS = [
    UserDocument,
    StoreDocument,
    ProductDocument,
    ComplaintDocument,
    LoyaltyAccountDocument,
    NotificationDocument,
    OfferDocument,
    ParkingSlotDocument,
    QueueDocument,
    EventReminderDocument,
    MovieBookingDocument,
    LostReportDocument,
    FavoriteDocument,
]

__all__ = [
    "ALL_DOCUMENT_MODELS",
    "UserDocument",
    "StoreDocument",
    "ProductDocument",
    "ComplaintDocument",
    "LoyaltyAccountDocument",
    "NotificationDocument",
    "OfferDocument",
    "ParkingSlotDocument",
    "QueueDocument",
    "EventReminderDocument",
    "MovieBookingDocument",
    "LostReportDocument",
    "FavoriteDocument",
]
