from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..managers.queues import manager
from ...api.v1.queues.routes import get_queue_state


router = APIRouter()


@router.websocket("/ws/queues/{store_id}")
async def queue_updates(websocket: WebSocket, store_id: int) -> None:  # pragma: no cover - websocket IO
	"""WebSocket endpoint streaming live queue state for a store.

	On connect, the current queue snapshot is sent immediately. Further
	updates are pushed whenever the queue mutates.
	"""

	await manager.connect(store_id, websocket)

	initial_state = get_queue_state(store_id)
	await websocket.send_json({"type": "queue.snapshot", "store_id": store_id, "state": initial_state})

	try:
		while True:
			# Currently we just keep the connection alive; messages from
			# clients are ignored but could be used for pings/subscriptions.
			await websocket.receive_text()
	except WebSocketDisconnect:
		manager.disconnect(store_id, websocket)
