import random
import json
from datetime import datetime, timedelta

# City boundary coordinates
city_coordinates = {
    "thane": {"lat_range": (19.1, 19.3), "long_range": (72.9, 73.3)},
    "mumbai": {"lat_range": (18.9, 19.2), "long_range": (72.7, 72.9)},
    "nashik": {"lat_range": (19.9, 20.1), "long_range": (73.7, 73.9)},
    "bengaluru": {"lat_range": (12.9, 13.2), "long_range": (77.5, 77.7)},
}

crime_types = [
    "Stalking", "Theft", "Robbery", "Assault", "Burglary", 
    "Fraud", "Cybercrime", "Vandalism", "Domestic Violence"
]

def random_date(start, end):
    """Generate a random datetime between start and end."""
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=random_seconds)

data = []
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 12, 31)

for i in range(1, 101):
    city = random.choice(list(city_coordinates.keys()))
    coords = city_coordinates[city]
    record = {
        "id": i,
        "crime_type": random.choice(crime_types),
        "latitude": round(random.uniform(*coords["lat_range"]), 6),
        "longitude": round(random.uniform(*coords["long_range"]), 6),
        "timestamp": random_date(start_date, end_date).strftime("%Y-%m-%d %H:%M:%S"),
        "age_victim": random.randint(10, 80),
        "city": city,
    }
    data.append(record)

with open("new_crime_data.json", "w") as f:
    json.dump(data, f, indent=2)

print("Data generated and saved to crime_data.json")
