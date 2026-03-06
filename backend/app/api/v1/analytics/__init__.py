"""Analytics & reporting API routes."""

from __future__ import annotations

import random
from datetime import datetime

from fastapi import APIRouter, Depends

from app.auth.schemas.users import User
from app.auth.services.security import require_admin, require_super_admin

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _generate_hourly_data() -> list[dict]:
    return [
        {"hour": h, "visitors": int(random.gauss(200, 80) * (1.3 if 12 <= h <= 14 or 17 <= h <= 19 else 0.7))}
        for h in range(9, 22)
    ]


def _generate_daily_sales(days: int = 7) -> list[dict]:
    labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [
        {
            "day": labels[i % 7],
            "revenue": round(random.uniform(15000, 45000), 2),
            "transactions": random.randint(80, 250),
        }
        for i in range(days)
    ]


def _generate_category_revenue() -> list[dict]:
    categories = ["Electronics", "Fashion", "Food", "Books", "Services", "Entertainment"]
    return [
        {"category": cat, "revenue": round(random.uniform(5000, 30000), 2), "percentage": 0}
        for cat in categories
    ]


# ── Store Admin Analytics ───────────────────────────────────────────

@router.get("/store/sales")
async def store_sales_analytics(
    current_user: User = Depends(require_admin),
    period: str = "weekly",
) -> dict:
    days = {"daily": 1, "weekly": 7, "monthly": 30}.get(period, 7)
    daily_data = _generate_daily_sales(days)
    total_revenue = sum(d["revenue"] for d in daily_data)
    total_transactions = sum(d["transactions"] for d in daily_data)
    return {
        "period": period,
        "total_revenue": round(total_revenue, 2),
        "total_transactions": total_transactions,
        "avg_transaction_value": round(total_revenue / max(total_transactions, 1), 2),
        "daily_breakdown": daily_data,
        "top_products": [
            {"name": "Wireless Earbuds", "units_sold": 45, "revenue": 4500.0},
            {"name": "Phone Case", "units_sold": 38, "revenue": 1900.0},
            {"name": "USB Cable", "units_sold": 32, "revenue": 640.0},
            {"name": "Screen Protector", "units_sold": 28, "revenue": 560.0},
            {"name": "Power Bank", "units_sold": 22, "revenue": 2200.0},
        ],
        "peak_hours": _generate_hourly_data(),
    }


@router.get("/store/customers")
async def store_customer_insights(
    current_user: User = Depends(require_admin),
) -> dict:
    return {
        "total_unique_customers": random.randint(500, 2000),
        "repeat_customer_rate": round(random.uniform(25, 60), 1),
        "avg_transaction_value": round(random.uniform(50, 200), 2),
        "customer_segments": [
            {"segment": "Frequent Shoppers", "count": random.randint(100, 300), "avg_spend": 180.50},
            {"segment": "Occasional Visitors", "count": random.randint(200, 500), "avg_spend": 85.25},
            {"segment": "One-time Buyers", "count": random.randint(150, 400), "avg_spend": 45.00},
            {"segment": "Window Shoppers", "count": random.randint(50, 150), "avg_spend": 15.00},
        ],
        "shopping_patterns": [
            {"hour": h, "avg_customers": random.randint(5, 50)}
            for h in range(9, 22)
        ],
        "offer_conversion_rate": round(random.uniform(5, 25), 1),
    }


# ── Super Admin Analytics ──────────────────────────────────────────

@router.get("/mall/overview")
async def mall_overview_analytics(
    current_user: User = Depends(require_super_admin),
) -> dict:
    now = datetime.now()
    return {
        "timestamp": now.isoformat(),
        "daily_visitors": random.randint(5000, 15000),
        "total_revenue": round(random.uniform(100000, 300000), 2),
        "active_stores": 47,
        "active_queues": random.randint(8, 20),
        "parking_utilization": round(random.uniform(40, 90), 1),
        "complaints_summary": {
            "open": random.randint(2, 15),
            "in_progress": random.randint(3, 10),
            "resolved_today": random.randint(5, 20),
        },
        "category_revenue": _generate_category_revenue(),
        "peak_hour_stats": _generate_hourly_data(),
        "trend": {
            "visitors_change_percent": round(random.uniform(-5, 15), 1),
            "revenue_change_percent": round(random.uniform(-3, 12), 1),
            "avg_satisfaction": round(random.uniform(3.5, 4.8), 1),
        },
    }


@router.get("/mall/crowd")
async def crowd_traffic_analytics(
    current_user: User = Depends(require_super_admin),
) -> dict:
    from app.ai import crowd_heatmap_generator

    now = datetime.now()
    heatmap = crowd_heatmap_generator.generate_heatmap(now.hour)
    congested = crowd_heatmap_generator.identify_congested_zones(heatmap)
    return {
        "timestamp": now.isoformat(),
        "mall_total_visitors": sum(z["visitor_count"] for z in heatmap),
        "heatmap": heatmap,
        "congestion_alerts": congested,
        "hourly_trend": _generate_hourly_data(),
    }


@router.get("/mall/queue-efficiency")
async def queue_efficiency_analytics(
    current_user: User = Depends(require_super_admin),
) -> dict:
    from app.ai import queue_predictor

    stores = [
        {"store_id": 1, "name": "ElectroHub", "type": "Electronics"},
        {"store_id": 2, "name": "Fashion Lane", "type": "Fashion"},
        {"store_id": 3, "name": "Book Nook", "type": "Books"},
        {"store_id": 4, "name": "Food Plaza", "type": "Food"},
        {"store_id": 5, "name": "Service Center", "type": "Services"},
    ]
    now = datetime.now()
    efficiency_data = []
    for store in stores:
        queue_len = random.randint(0, 25)
        avg_service = random.uniform(3, 10)
        predicted = queue_predictor.predict_wait_time(queue_len, avg_service, store["type"], now.hour)
        abandonment = queue_predictor.predict_abandonment_rate(predicted, queue_len)
        efficiency_data.append(
            {
                **store,
                "queue_length": queue_len,
                "avg_service_time_min": round(avg_service, 1),
                "predicted_wait_min": predicted,
                "abandonment_rate_percent": abandonment,
                "efficiency_score": round(max(100 - abandonment - (predicted / 2), 0), 1),
            }
        )
    avg_wait = sum(d["predicted_wait_min"] for d in efficiency_data) / len(efficiency_data)
    avg_abandonment = sum(d["abandonment_rate_percent"] for d in efficiency_data) / len(efficiency_data)
    return {
        "stores": efficiency_data,
        "mall_avg_wait_min": round(avg_wait, 1),
        "mall_avg_abandonment_percent": round(avg_abandonment, 1),
    }


@router.get("/mall/parking")
async def parking_analytics(
    current_user: User = Depends(require_super_admin),
) -> dict:
    from app.ai import parking_demand_predictor

    now = datetime.now()
    hourly_predictions = [
        {
            "hour": h,
            "predicted_occupancy": parking_demand_predictor.predict_occupancy(h, now.weekday()),
        }
        for h in range(9, 22)
    ]
    peak_hour = max(hourly_predictions, key=lambda x: x["predicted_occupancy"])
    return {
        "current_utilization": round(random.uniform(40, 85), 1),
        "avg_duration_minutes": round(random.uniform(60, 180), 1),
        "peak_time": peak_hour,
        "hourly_predictions": hourly_predictions,
        "zone_utilization": {
            "A": round(random.uniform(50, 95), 1),
            "B": round(random.uniform(40, 85), 1),
            "C": round(random.uniform(30, 75), 1),
            "D": round(random.uniform(20, 65), 1),
        },
    }
