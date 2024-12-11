import asyncio
from geopy.distance import geodesic

class HotspotDetector:
    def __init__(self):
        # Hardcoded hotspot location (latitude, longitude)
        self.hotspot_location = (19.0295559, 72.8506955)  # Example coordinates (New York)

    async def check_proximity(self, client_location: tuple) -> bool:
        """Check if the client is within 500 meters of the hotspot"""
        distance = geodesic(client_location, self.hotspot_location).meters
        print(f"Distance from hotspot: {distance} meters")  # Log the distance
        return distance <= 500  # Return True if within 500 meters, otherwise False

