from __future__ import annotations

from dataclasses import asdict, dataclass, field
from time import time
from typing import Dict, List, Literal


QueueTokenStatus = Literal["waiting", "serving", "served", "skipped"]


@dataclass
class QueueToken:
	token_number: int
	status: QueueTokenStatus = "waiting"
	joined_at: float = field(default_factory=time)
	started_at: float | None = None
	completed_at: float | None = None


@dataclass
class QueueState:
	store_id: int
	is_paused: bool = False
	next_token: int = 1
	current_token: int | None = None
	tokens: List[QueueToken] = field(default_factory=list)

	AVG_SERVICE_MINUTES: float = 5.0

	def enqueue(self) -> QueueToken:
		"""Add a new token to the queue and return it."""
		token = QueueToken(token_number=self.next_token)
		self.next_token += 1
		self.tokens.append(token)
		return token

	def _waiting_tokens(self) -> List[QueueToken]:
		return [t for t in self.tokens if t.status == "waiting"]

	def _current_token_obj(self) -> QueueToken | None:
		if self.current_token is None:
			return None
		for token in self.tokens:
			if token.token_number == self.current_token:
				return token
		return None

	def advance(self, skip_current: bool = False) -> None:
		"""Move queue to the next token.

		Marks the current token as ``served`` or ``skipped`` and promotes the
		next waiting token (if any) to ``serving``.
		"""
		current = self._current_token_obj()
		if current is not None:
			current.status = "skipped" if skip_current else "served"
			current.completed_at = time()

		waiting = self._waiting_tokens()
		if not waiting:
			self.current_token = None
			return

		next_token = waiting[0]
		next_token.status = "serving"
		next_token.started_at = time()
		self.current_token = next_token.token_number

	def summary(self) -> dict:
		waiting = self._waiting_tokens()
		served = [t for t in self.tokens if t.status == "served"]
		avg_wait = len(waiting) * self.AVG_SERVICE_MINUTES
		return {
			"store_id": self.store_id,
			"is_paused": self.is_paused,
			"current_token": self.current_token,
			"waiting_count": len(waiting),
			"total_served": len(served),
			"estimated_wait_minutes_for_new_customer": avg_wait,
		}

	def serialize(self) -> dict:
		return {
			**self.summary(),
			"tokens": [asdict(t) for t in self.tokens],
		}
