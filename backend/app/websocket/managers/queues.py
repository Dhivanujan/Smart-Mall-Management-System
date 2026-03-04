from __future__ import annotations

from typing import Dict, Set

from fastapi import WebSocket


class QueueConnectionManager:
	"""Manage WebSocket connections for queue updates per store."""

	def __init__(self) -> None:
		self._connections: Dict[int, Set[WebSocket]] = {}

	async def connect(self, store_id: int, websocket: WebSocket) -> None:
		await websocket.accept()
		self._connections.setdefault(store_id, set()).add(websocket)

	def disconnect(self, store_id: int, websocket: WebSocket) -> None:
		store_conns = self._connections.get(store_id)
		if not store_conns:
			return
		store_conns.discard(websocket)
		if not store_conns:
			self._connections.pop(store_id, None)

	async def broadcast_json(self, store_id: int, message: dict) -> None:
		"""Broadcast a JSON message to all clients of a store.

		Failures on individual connections are tolerated so a single broken
		client does not affect others.
		"""

		store_conns = list(self._connections.get(store_id, set()))
		for websocket in store_conns:
			try:
				await websocket.send_json(message)
			except Exception:
				self.disconnect(store_id, websocket)


manager = QueueConnectionManager()

__all__ = ["manager", "QueueConnectionManager"]
