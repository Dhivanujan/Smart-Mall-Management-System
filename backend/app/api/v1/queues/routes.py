from __future__ import annotations

from typing import List

from fastapi import APIRouter, HTTPException

from ....db.models.queue import QueueDocument
from ....websocket.managers.queues import manager as ws_manager


router = APIRouter()

AVG_SERVICE_MINUTES = 5


async def _get_or_create_queue(store_id: int) -> QueueDocument:
	doc = await QueueDocument.find_one({"store_id": store_id})
	if doc is None:
		doc = QueueDocument(store_id=store_id)
		await doc.insert()
	return doc


def _serialize(doc: QueueDocument) -> dict:
	waiting = [t for t in doc.tokens if t.get("status") == "waiting"]
	served = [t for t in doc.tokens if t.get("status") == "served"]
	skipped = [t for t in doc.tokens if t.get("status") == "skipped"]
	return {
		"store_id": doc.store_id,
		"is_paused": doc.is_paused,
		"current_token": doc.current_token,
		"total_waiting": len(waiting),
		"total_served": len(served),
		"total_skipped": len(skipped),
		"tokens": doc.tokens,
	}


def _summary(doc: QueueDocument) -> dict:
	waiting = [t for t in doc.tokens if t.get("status") == "waiting"]
	return {
		"store_id": doc.store_id,
		"is_paused": doc.is_paused,
		"current_token": doc.current_token,
		"waiting_count": len(waiting),
	}


async def get_queue_state(store_id: int) -> dict:
	doc = await _get_or_create_queue(store_id)
	return _serialize(doc)


async def _broadcast_update(store_id: int) -> None:
	state = await get_queue_state(store_id)
	await ws_manager.broadcast_json(
		store_id,
		{"type": "queue.update", "store_id": store_id, "state": state},
	)


async def _advance(doc: QueueDocument, skip_current: bool = False) -> None:
	if doc.current_token is not None:
		for t in doc.tokens:
			if t.get("token_number") == doc.current_token and t.get("status") == "serving":
				t["status"] = "skipped" if skip_current else "served"
				break
	waiting = [t for t in doc.tokens if t.get("status") == "waiting"]
	if waiting:
		next_t = waiting[0]
		next_t["status"] = "serving"
		doc.current_token = next_t["token_number"]
	else:
		doc.current_token = None
	await doc.save()


@router.get("/queues/{store_id}")
async def read_queue(store_id: int) -> dict:
	return {"queue": await get_queue_state(store_id)}


@router.post("/queues/{store_id}/join")
async def join_queue(store_id: int) -> dict:
	doc = await _get_or_create_queue(store_id)
	if doc.is_paused:
		raise HTTPException(status_code=409, detail="Queue is currently paused")

	token_number = doc.next_token
	doc.next_token += 1
	new_token = {"token_number": token_number, "status": "waiting"}
	doc.tokens.append(new_token)

	waiting_before = len([t for t in doc.tokens if t.get("status") == "waiting" and t["token_number"] < token_number])
	estimated_wait = (waiting_before + 1) * AVG_SERVICE_MINUTES

	if doc.current_token is None:
		await _advance(doc)
	else:
		await doc.save()

	await _broadcast_update(store_id)

	return {
		"store_id": store_id,
		"token_number": token_number,
		"position": waiting_before + 1,
		"estimated_wait_minutes": estimated_wait,
	}


@router.get("/queues/{store_id}/status")
async def queue_status(store_id: int, token: int | None = None) -> dict:
	doc = await _get_or_create_queue(store_id)
	state = _serialize(doc)
	result: dict = {"queue": state}

	if token is not None:
		matching = next((t for t in doc.tokens if t.get("token_number") == token), None)
		if matching is None:
			raise HTTPException(status_code=404, detail="Token not found in queue")

		waiting_ahead = [
			t for t in doc.tokens
			if t.get("status") == "waiting" and t["token_number"] < token
		]
		result["customer"] = {
			"token_number": token,
			"status": matching["status"],
			"waiting_ahead": len(waiting_ahead),
			"estimated_wait_minutes": (len(waiting_ahead) + 1) * AVG_SERVICE_MINUTES,
		}

	return result


async def admin_queue_summaries() -> List[dict]:
	docs = await QueueDocument.find().to_list()
	return [_summary(d) for d in docs]


async def admin_advance_queue(store_id: int, skip_current: bool = False) -> dict:
	doc = await _get_or_create_queue(store_id)
	await _advance(doc, skip_current=skip_current)
	await _broadcast_update(store_id)
	return _serialize(doc)


async def admin_set_queue_paused(store_id: int, paused: bool) -> dict:
	doc = await _get_or_create_queue(store_id)
	doc.is_paused = paused
	await doc.save()
	await _broadcast_update(store_id)
	return _serialize(doc)
