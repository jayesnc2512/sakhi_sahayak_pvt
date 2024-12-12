import json

class AlertHandler:
    def __init__(self):
        self.connected_clients = []  # Store active WebSocket connections

    async def process_alert(self, location, audio_link=None):
        # Format alert data
        alert_data = {
            "location": location,
            "message": "Emergency alert received from app."
        }
        if audio_link:
            alert_data["audio_link"] = audio_link

        print(f"Processing alert: {alert_data}")
        await self.send_alert_to_dashboard(alert_data)

    async def send_alert_to_dashboard(self, alert_data):
        if not self.connected_clients:
            # print("No connected dashboard clients to send alerts.")
            return

        alert_message = json.dumps(alert_data)
        print(f"Sending alert to dashboard: {alert_message}")

        for client in self.connected_clients:
            try:
                await client.send_text(alert_message)
            except Exception as e:
                print(f"Failed to send alert to client: {e}")

    async def add_dashboard_connection(self, websocket):
        await websocket.accept()
        self.connected_clients.append(websocket)
        print(f'Connected clients: {self.connected_clients}')
        print("Dashboard connected via WebSocket.")

    async def remove_dashboard_connection(self, websocket):
        if websocket in self.connected_clients:
            self.connected_clients.remove(websocket)
            print("Dashboard WebSocket disconnected.")

