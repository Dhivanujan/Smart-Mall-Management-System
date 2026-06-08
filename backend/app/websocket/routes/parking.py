from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..managers.parking import manager

router = APIRouter()

@router.websocket("/ws/parking")
async def parking_updates(websocket: WebSocket) -> None:
    """WebSocket endpoint streaming live parking state updates."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
