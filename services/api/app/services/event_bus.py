import asyncio
import json
from typing import Any

_subscribers: list[asyncio.Queue[dict[str, Any]]] = []


def publish_event(event_type: str, payload: dict[str, Any]) -> None:
    message = {"type": event_type, **payload}
    for queue in list(_subscribers):
        try:
            queue.put_nowait(message)
        except Exception:
            pass


async def subscribe_events():
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue()
    _subscribers.append(queue)
    try:
        while True:
            event = await queue.get()
            yield f"data: {json.dumps(event, default=str)}\n\n"
    finally:
        if queue in _subscribers:
            _subscribers.remove(queue)
