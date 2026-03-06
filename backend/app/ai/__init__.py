"""AI/ML prediction modules for Smart Mall."""

from __future__ import annotations

import math
import random
from time import time


class QueuePredictor:
    """Predicts estimated waiting times based on queue metrics."""

    def predict_wait_time(
        self,
        queue_length: int,
        avg_service_minutes: float,
        store_type: str,
        hour_of_day: int,
    ) -> float:
        base_wait = queue_length * avg_service_minutes

        type_factors = {
            "Electronics": 1.3,
            "Fashion": 1.1,
            "Food": 0.8,
            "Books": 0.9,
            "Services": 1.4,
        }
        type_factor = type_factors.get(store_type, 1.0)

        if 12 <= hour_of_day <= 14 or 17 <= hour_of_day <= 19:
            time_factor = 1.25
        elif 10 <= hour_of_day <= 11 or 15 <= hour_of_day <= 16:
            time_factor = 1.1
        else:
            time_factor = 0.9

        predicted = base_wait * type_factor * time_factor
        return round(max(predicted, 0), 1)

    def predict_abandonment_rate(
        self, avg_wait_minutes: float, queue_length: int
    ) -> float:
        rate = 1 / (1 + math.exp(-(avg_wait_minutes - 15) / 5))
        if queue_length > 20:
            rate = min(rate * 1.2, 1.0)
        return round(rate * 100, 1)


class OfferRecommender:
    """Recommends offers based on user behavior patterns."""

    def recommend(
        self,
        user_history: list[dict],
        available_offers: list[dict],
        top_n: int = 5,
    ) -> list[dict]:
        if not available_offers:
            return []

        visited_categories: set[str] = set()
        visited_stores: set[int] = set()
        for h in user_history:
            if "category" in h:
                visited_categories.add(h["category"])
            if "store_id" in h:
                visited_stores.add(h["store_id"])

        scored: list[tuple[float, dict]] = []
        for offer in available_offers:
            score = 50.0
            if offer.get("store_id") in visited_stores:
                score += 30.0
            if offer.get("discount_percent", 0) > 20:
                score += 15.0
            if offer.get("redemption_count", 0) > 10:
                score += 10.0
            score += random.uniform(0, 5)
            scored.append((score, offer))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_n]]


class ParkingDemandPredictor:
    """Predicts parking demand patterns."""

    def predict_occupancy(self, hour_of_day: int, day_of_week: int) -> float:
        base_patterns = {
            10: 40, 11: 55, 12: 75, 13: 85, 14: 80,
            15: 70, 16: 65, 17: 78, 18: 88, 19: 82,
            20: 60, 21: 40, 22: 25,
        }
        base = base_patterns.get(hour_of_day, 30)

        if day_of_week >= 5:
            base = min(base * 1.2, 100)

        noise = random.uniform(-5, 5)
        return round(min(max(base + noise, 0), 100), 1)

    def suggest_allocation(
        self, current_utilization: float, zone_stats: dict
    ) -> list[dict]:
        suggestions: list[dict] = []
        for zone, stats in zone_stats.items():
            util = stats.get("utilization_percent", 0)
            if util > 90:
                suggestions.append(
                    {
                        "zone": zone,
                        "action": "redirect",
                        "message": f"Zone {zone} is at {util}% capacity. Redirect to less busy zones.",
                        "priority": "high",
                    }
                )
            elif util < 30:
                suggestions.append(
                    {
                        "zone": zone,
                        "action": "promote",
                        "message": f"Zone {zone} is underutilized at {util}%. Can absorb overflow.",
                        "priority": "low",
                    }
                )
        return suggestions


class CrowdHeatmapGenerator:
    """Generates simulated crowd density heatmap data."""

    ZONES = [
        {"id": "entrance-main", "name": "Main Entrance", "x": 50, "y": 10},
        {"id": "entrance-side", "name": "Side Entrance", "x": 90, "y": 50},
        {"id": "food-court", "name": "Food Court", "x": 50, "y": 80},
        {"id": "electronics-wing", "name": "Electronics Wing", "x": 20, "y": 40},
        {"id": "fashion-district", "name": "Fashion District", "x": 70, "y": 40},
        {"id": "entertainment", "name": "Entertainment Zone", "x": 50, "y": 60},
        {"id": "parking-a", "name": "Parking Zone A", "x": 10, "y": 10},
        {"id": "parking-b", "name": "Parking Zone B", "x": 90, "y": 10},
        {"id": "services", "name": "Services Area", "x": 30, "y": 70},
        {"id": "atrium", "name": "Central Atrium", "x": 50, "y": 45},
    ]

    def generate_heatmap(self, hour_of_day: int) -> list[dict]:
        hour_multipliers = {
            10: 0.4, 11: 0.6, 12: 0.9, 13: 1.0, 14: 0.85,
            15: 0.7, 16: 0.65, 17: 0.8, 18: 0.95, 19: 0.9,
            20: 0.6, 21: 0.35,
        }
        base_mult = hour_multipliers.get(hour_of_day, 0.3)

        zone_weights = {
            "entrance-main": 0.8,
            "entrance-side": 0.5,
            "food-court": 1.2 if 12 <= hour_of_day <= 14 else 0.6,
            "electronics-wing": 0.7,
            "fashion-district": 0.9,
            "entertainment": 1.0 if hour_of_day >= 16 else 0.5,
            "parking-a": 0.4,
            "parking-b": 0.3,
            "services": 0.5,
            "atrium": 0.85,
        }

        result: list[dict] = []
        for zone in self.ZONES:
            weight = zone_weights.get(zone["id"], 0.5)
            density = min(base_mult * weight * 100 + random.uniform(-10, 10), 100)
            density = max(density, 5)
            result.append(
                {
                    **zone,
                    "density": round(density, 1),
                    "visitor_count": int(density * 2.5),
                    "congestion_level": (
                        "high" if density > 75 else "medium" if density > 45 else "low"
                    ),
                }
            )
        return result

    def identify_congested_zones(self, heatmap: list[dict]) -> list[dict]:
        return [
            {
                "zone_id": z["id"],
                "zone_name": z["name"],
                "density": z["density"],
                "alert": f"{z['name']} is experiencing high crowd density ({z['density']}%)",
            }
            for z in heatmap
            if z["density"] > 75
        ]


# Singleton instances
queue_predictor = QueuePredictor()
offer_recommender = OfferRecommender()
parking_demand_predictor = ParkingDemandPredictor()
crowd_heatmap_generator = CrowdHeatmapGenerator()
