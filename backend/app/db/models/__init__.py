"""Beanie document models for MongoDB collections."""

from .user import UserDocument
from .store import StoreDocument, ProductDocument
from .complaint import ComplaintDocument
from .loyalty import LoyaltyAccountDocument
from .notification import NotificationDocument
from .offer import OfferDocument
from .parking import ParkingSlotDocument
from .queue import QueueDocument
from .event_reminder import EventReminderDocument
from .movie_booking import MovieBookingDocument
from .lost_report import LostReportDocument

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
]
