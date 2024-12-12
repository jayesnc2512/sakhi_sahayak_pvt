from fastapi import WebSocket, WebSocketDisconnect

# Store active WebSocket connections
connected_clients = []

async def handle_dashboard_websocket(websocket: WebSocket):
    """
    Helper function to manage WebSocket connection for the dashboard.
    """
    await websocket.accept()
    connected_clients.append(websocket)
    print("Dashboard connected!")

    try:
        while True:
            # Wait for messages from the frontend
            message = await websocket.receive_text()
            print(f"Message from dashboard: {message}")

            # Optionally broadcast messages to other clients
            for client in connected_clients:
                if client != websocket:
                    await client.send_text(f"Broadcast: {message}")

    except WebSocketDisconnect:
        print("Dashboard disconnected!")
        connected_clients.remove(websocket)
