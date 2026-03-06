from __future__ import annotations

from dataclasses import asdict
from typing import Dict, List

from fastapi import APIRouter, HTTPException

from ....models.queue import QueueState, QueueToken
from ....websocket.managers.queues import manager as ws_manager


router = APIRouter()


_QUEUES: Dict[int, QueueState] = {}


def _get_or_create_queue(store_id: int) -> QueueState:
	if store_id not in _QUEUES:
		_QUEUES[store_id] = QueueState(store_id=store_id)
	return _QUEUES[store_id]


def get_queue_state(store_id: int) -> dict:
	"""Return a serialisable snapshot of a store's queue state."""
	queue = _get_or_create_queue(store_id)
	return queue.serialize()


async def _broadcast_update(store_id: int) -> None:
	"""Broadcast the latest queue state over WebSocket for a store."""
	state = get_queue_state(store_id)
	await ws_manager.broadcast_json(
		store_id,
		{"type": "queue.update", "store_id": store_id, "state": state},
	)


@router.get("/queues/{store_id}")
async def read_queue(store_id: int) -> dict:
	"""Public endpoint to read the current queue state for a store."""

	return {"queue": get_queue_state(store_id)}


@router.post("/queues/{store_id}/join")
async def join_queue(store_id: int) -> dict:
	"""Join the queue for a given store.

	Returns the issued token number and basic analytics such as the
	position in the queue and an estimated wait time.
	"""

	queue = _get_or_create_queue(store_id)
	if queue.is_paused:
		raise HTTPException(status_code=409, detail="Queue is currently paused")

	new_token = queue.enqueue()
	waiting_before = len([t for t in queue.tokens if t.status == "waiting" and t.token_number < new_token.token_number])
	estimated_wait = (waiting_before + 1) * queue.AVG_SERVICE_MINUTES

	# If there is no current token, advance immediately so someone is being served
	if queue.current_token is None:
		queue.advance()

	await _broadcast_update(store_id)

	return {
		"store_id": store_id,
		"token_number": new_token.token_number,
		"position": waiting_before + 1,
		"estimated_wait_minutes": estimated_wait,
	}


@router.get("/queues/{store_id}/status")
async def queue_status(store_id: int, token: int | None = None) -> dict:
	"""Return queue status, optionally from the perspective of a token."""

	queue = _get_or_create_queue(store_id)
	state = queue.serialize()
	result: dict = {"queue": state}

	if token is not None:
		matching = next((t for t in queue.tokens if t.token_number == token), None)
		if matching is None:
			raise HTTPException(status_code=404, detail="Token not found in queue")

		waiting_ahead = [
			asdict(t)
			for t in queue.tokens
			if t.status == "waiting" and t.token_number < token
		]
		result["customer"] = {
			"token_number": token,
			"status": matching.status,
			"waiting_ahead": len(waiting_ahead),
			"estimated_wait_minutes": (len(waiting_ahead) + 1) * queue.AVG_SERVICE_MINUTES,
		}

	return result


def admin_queue_summaries() -> List[dict]:
	"""Return lightweight summaries for all known store queues."""

	return [queue.summary() for queue in _QUEUES.values()]


async def admin_advance_queue(store_id: int, skip_current: bool = False) -> dict:
	queue = _get_or_create_queue(store_id)
	queue.advance(skip_current=skip_current)
	await _broadcast_update(store_id)
	return queue.serialize()


async def admin_set_queue_paused(store_id: int, paused: bool) -> dict:
	queue = _get_or_create_queue(store_id)
	queue.is_paused = paused
	await _broadcast_update(store_id)
	return queue.serialize()
