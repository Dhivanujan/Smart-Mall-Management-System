"""Seed MongoDB with demo data if collections are empty."""

from __future__ import annotations

import logging
from time import time

import bcrypt

from .models.user import UserDocument
from .models.store import StoreDocument, ProductDocument
from .models.complaint import ComplaintDocument
from .models.loyalty import LoyaltyAccountDocument
from .models.notification import NotificationDocument
from .models.offer import OfferDocument
from .models.parking import ParkingSlotDocument

logger = logging.getLogger("smart_mall.db.seed")


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


async def seed_database() -> None:
    """Insert demo data into MongoDB if the users collection is empty."""

    existing_users = await UserDocument.count()
    if existing_users > 0:
        logger.info("Database already seeded — skipping")
        return

    logger.info("Seeding database with demo data …")

    # ── Users ───────────────────────────────────────────────────
    await UserDocument.insert_many([
        UserDocument(
            username="admin@example.com",
            full_name="Mall Administrator",
            email="admin@example.com",
            role="admin",
            hashed_password=_hash_password("admin123"),
        ),
        UserDocument(
            username="superadmin@example.com",
            full_name="Platform Super Admin",
            email="superadmin@example.com",
            role="super_admin",
            hashed_password=_hash_password("super123"),
        ),
        UserDocument(
            username="customer@example.com",
            full_name="Demo Customer",
            email="customer@example.com",
            role="customer",
            hashed_password=_hash_password("customer123"),
        ),
    ])

    # ── Stores ──────────────────────────────────────────────────
    stores_data = [
        {"store_id": 1, "name": "ElectroHub", "category": "Electronics", "status": "open", "average_rating": 4.6, "current_footfall": 120, "current_occupancy_percent": 68.0, "address": "Ground Floor, Zone A, Unit 101", "working_hours": "10:00 AM - 9:00 PM", "floor": 1, "map_x": 20, "map_y": 30, "description": "Your one-stop shop for electronics and gadgets"},
        {"store_id": 2, "name": "Fashion Lane", "category": "Fashion", "status": "open", "average_rating": 4.3, "current_footfall": 95, "current_occupancy_percent": 54.0, "address": "First Floor, Zone B, Unit 205", "working_hours": "10:00 AM - 9:00 PM", "floor": 2, "map_x": 60, "map_y": 40, "description": "Trendy fashion for all ages"},
        {"store_id": 3, "name": "Book Nook", "category": "Books", "status": "closed", "average_rating": 4.8, "current_footfall": 12, "current_occupancy_percent": 20.0, "address": "Second Floor, Zone C, Unit 310", "working_hours": "10:00 AM - 8:00 PM", "floor": 3, "map_x": 40, "map_y": 70, "description": "Books, stationery, and more"},
        {"store_id": 4, "name": "Food Plaza", "category": "Food", "status": "open", "average_rating": 4.2, "current_footfall": 200, "current_occupancy_percent": 82.0, "address": "Ground Floor, Zone D, Unit 150", "working_hours": "8:00 AM - 10:00 PM", "floor": 1, "map_x": 50, "map_y": 80, "description": "Multi-cuisine food court"},
        {"store_id": 5, "name": "Gadget World", "category": "Electronics", "status": "open", "average_rating": 4.1, "current_footfall": 78, "current_occupancy_percent": 45.0, "address": "Ground Floor, Zone A, Unit 105", "working_hours": "10:00 AM - 9:00 PM", "floor": 1, "map_x": 25, "map_y": 35, "description": "Latest gadgets and accessories"},
        {"store_id": 6, "name": "Style Studio", "category": "Fashion", "status": "open", "average_rating": 4.5, "current_footfall": 88, "current_occupancy_percent": 52.0, "address": "First Floor, Zone B, Unit 210", "working_hours": "10:00 AM - 9:00 PM", "floor": 2, "map_x": 65, "map_y": 45, "description": "Premium fashion brands"},
        {"store_id": 7, "name": "Fresh Mart", "category": "Food", "status": "open", "average_rating": 4.0, "current_footfall": 150, "current_occupancy_percent": 75.0, "address": "Ground Floor, Zone D, Unit 155", "working_hours": "8:00 AM - 10:00 PM", "floor": 1, "map_x": 55, "map_y": 85, "description": "Fresh groceries and daily needs"},
        {"store_id": 8, "name": "Sports Arena", "category": "Sports", "status": "open", "average_rating": 4.4, "current_footfall": 65, "current_occupancy_percent": 38.0, "address": "Second Floor, Zone A, Unit 301", "working_hours": "9:00 AM - 9:00 PM", "floor": 3, "map_x": 15, "map_y": 50, "description": "Sports equipment and activewear"},
        {"store_id": 9, "name": "Home Comforts", "category": "Home & Living", "status": "open", "average_rating": 4.7, "current_footfall": 55, "current_occupancy_percent": 32.0, "address": "First Floor, Zone C, Unit 250", "working_hours": "10:00 AM - 8:00 PM", "floor": 2, "map_x": 45, "map_y": 55, "description": "Home decor and furnishings"},
        {"store_id": 10, "name": "Toy Kingdom", "category": "Entertainment", "status": "maintenance", "average_rating": 4.3, "current_footfall": 0, "current_occupancy_percent": 0.0, "address": "Third Floor, Zone B, Unit 401", "working_hours": "10:00 AM - 8:00 PM", "floor": 4, "map_x": 70, "map_y": 30, "description": "Toys and entertainment for kids"},
    ]
    await StoreDocument.insert_many([StoreDocument(**s) for s in stores_data])

    # ── Products ────────────────────────────────────────────────
    products_data = [
        {"product_id": 101, "store_id": 1, "name": "Noise-cancelling Headphones", "price": 199.99, "category": "Audio"},
        {"product_id": 102, "store_id": 1, "name": "4K Smart TV", "price": 899.0, "category": "TV"},
        {"product_id": 103, "store_id": 1, "name": "Gaming Laptop", "price": 1499.0, "category": "Computers"},
        {"product_id": 104, "store_id": 1, "name": "Wireless Mouse", "price": 29.99, "category": "Accessories"},
        {"product_id": 105, "store_id": 1, "name": "Bluetooth Speaker", "price": 79.99, "category": "Audio"},
        {"product_id": 201, "store_id": 2, "name": "Denim Jacket", "price": 79.99, "category": "Outerwear"},
        {"product_id": 202, "store_id": 2, "name": "Sneakers", "price": 59.0, "category": "Shoes"},
        {"product_id": 203, "store_id": 2, "name": "Everyday T-Shirt", "price": 19.0, "category": "Basics"},
        {"product_id": 204, "store_id": 2, "name": "Summer Dress", "price": 49.99, "category": "Dresses"},
        {"product_id": 205, "store_id": 2, "name": "Leather Belt", "price": 34.99, "category": "Accessories"},
        {"product_id": 301, "store_id": 3, "name": "Bestselling Thriller", "price": 14.99, "category": "Fiction"},
        {"product_id": 302, "store_id": 3, "name": "Travel Guide", "price": 24.0, "category": "Travel"},
        {"product_id": 303, "store_id": 3, "name": "Cookbook Masterclass", "price": 29.99, "category": "Cooking"},
        {"product_id": 401, "store_id": 4, "name": "Combo Meal", "price": 12.99, "category": "Meals"},
        {"product_id": 402, "store_id": 4, "name": "Pizza Slice", "price": 4.99, "category": "Fast Food"},
        {"product_id": 403, "store_id": 4, "name": "Fresh Juice", "price": 5.99, "category": "Beverages"},
        {"product_id": 501, "store_id": 5, "name": "Smart Watch", "price": 249.0, "category": "Wearables"},
        {"product_id": 502, "store_id": 5, "name": "Tablet 10 inch", "price": 349.0, "category": "Tablets"},
        {"product_id": 503, "store_id": 5, "name": "USB-C Hub", "price": 45.0, "category": "Accessories"},
        {"product_id": 601, "store_id": 6, "name": "Designer Handbag", "price": 199.0, "category": "Bags"},
        {"product_id": 602, "store_id": 6, "name": "Silk Scarf", "price": 59.0, "category": "Accessories"},
        {"product_id": 701, "store_id": 7, "name": "Organic Fruit Box", "price": 15.99, "category": "Fruits"},
        {"product_id": 702, "store_id": 7, "name": "Fresh Bread", "price": 3.99, "category": "Bakery"},
        {"product_id": 801, "store_id": 8, "name": "Running Shoes", "price": 89.99, "category": "Footwear"},
        {"product_id": 802, "store_id": 8, "name": "Yoga Mat", "price": 29.99, "category": "Fitness"},
        {"product_id": 901, "store_id": 9, "name": "Table Lamp", "price": 45.0, "category": "Lighting"},
        {"product_id": 902, "store_id": 9, "name": "Throw Pillow Set", "price": 35.0, "category": "Decor"},
        {"product_id": 1001, "store_id": 10, "name": "LEGO Set", "price": 69.99, "category": "Building"},
        {"product_id": 1002, "store_id": 10, "name": "Board Game Collection", "price": 39.99, "category": "Games"},
    ]
    await ProductDocument.insert_many([ProductDocument(**p) for p in products_data])

    # ── Complaints ──────────────────────────────────────────────
    now = time()
    await ComplaintDocument.insert_many([
        ComplaintDocument(complaint_id=1, username="customer@example.com", category="queue", subject="Long wait at ElectroHub", description="Waited 45 minutes in queue", store_id=1, created_at=now, updated_at=now),
        ComplaintDocument(complaint_id=2, username="customer@example.com", category="parking", subject="Parking slot not available", description="Could not find parking in Zone A", status="in_progress", created_at=now, updated_at=now, logs=[{"message": "Status changed from open to in_progress", "author": "admin@example.com", "timestamp": now}]),
        ComplaintDocument(complaint_id=3, username="demo_user", category="cleanliness", subject="Restroom needs cleaning", description="Floor 2 restrooms are not clean", created_at=now, updated_at=now),
    ])

    # ── Notifications ───────────────────────────────────────────
    await NotificationDocument.insert_many([
        NotificationDocument(notification_id=1, username="admin@example.com", notification_type="queue_status", title="Queue Update", message="Token #5 is now being served at ElectroHub"),
        NotificationDocument(notification_id=2, username="admin@example.com", notification_type="offer", title="New Offer!", message="20% off on all Electronics this weekend"),
        NotificationDocument(notification_id=3, username="admin@example.com", notification_type="parking_expiry", title="Parking Reminder", message="Your parking reservation expires in 30 minutes"),
        NotificationDocument(notification_id=4, username="admin@example.com", notification_type="system", title="Welcome!", message="Welcome to Smart Mall Management System"),
        NotificationDocument(notification_id=5, username="superadmin@example.com", notification_type="complaint_response", title="Complaint Updated", message="Complaint #1 has been resolved"),
        NotificationDocument(notification_id=6, username="superadmin@example.com", notification_type="system", title="System Alert", message="System maintenance scheduled for tonight"),
    ])

    # ── Offers ──────────────────────────────────────────────────
    await OfferDocument.insert_many([
        OfferDocument(offer_id=1, store_id=1, title="Summer Electronics Sale", description="Get amazing discounts on all electronics", discount_percent=25.0, max_redemptions=100, redemption_count=5),
        OfferDocument(offer_id=2, store_id=1, title="Buy 2 Get 1 Free", description="On select accessories", discount_percent=33.0, redemption_count=5),
        OfferDocument(offer_id=3, store_id=2, title="Fashion Week Special", description="Flat discount on new arrivals", discount_percent=20.0, redemption_count=5),
        OfferDocument(offer_id=4, store_id=2, title="Clearance Sale", description="End of season clearance", discount_percent=50.0),
        OfferDocument(offer_id=5, store_id=3, title="Book Bundle Deal", description="Buy 3 books at special price", discount_percent=15.0),
    ])

    # ── Parking slots ───────────────────────────────────────────
    parking_slots = []
    zones = ["A", "B", "C", "D"]
    per_zone = 50
    for zone in zones:
        for i in range(1, per_zone + 1):
            floor = (i - 1) // 25 + 1
            slot_id = f"{zone}-{i:03d}"
            status = "available"
            vehicle_number = None
            reserved_by = None
            idx = (zones.index(zone)) * per_zone + i - 1
            if idx < 15:
                status = "occupied"
                vehicle_number = f"VH-{slot_id[-3:]}"
            elif idx < 20:
                status = "reserved"
                reserved_by = "demo_customer"
            parking_slots.append(ParkingSlotDocument(
                slot_id=slot_id,
                zone=zone,
                floor=floor,
                status=status,
                vehicle_number=vehicle_number,
                reserved_by=reserved_by,
            ))
    await ParkingSlotDocument.insert_many(parking_slots)

    logger.info("Database seeding complete")
