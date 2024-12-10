import random
import json
from datetime import datetime, timedelta

# Predefined city points
city_coordinates = {
    "thane": [
        (19.230089, 72.966235),
        (19.186970, 72.994888),
        (19.184051, 73.009317),
        (19.149352, 72.992826),
        (19.162649, 73.024090),
        (19.266781, 72.965067),
        (19.235989, 72.992208)
    ],
    "mumbai": [
        (18.999381, 72.835958),
        (19.026971, 72.857946),
        (19.042679, 72.920953),
        (19.090704, 72.841868),
        (19.131708, 72.949812),
        (19.079705, 72.859517),
        (19.065558, 72.930427)
    ],
    "nashik": [
        (20.011435, 73.789802),
        (20.001543, 73.792015),
        (19.983967, 73.774290),
        (19.988342, 73.742401),
        (20.034218, 73.764511)
    ],
    "bengaluru": [
        (12.971598, 77.594566),
        (12.985289, 77.606234),
        (12.962678, 77.587134),
        (13.008521, 77.630345),
        (12.948125, 77.532450)
    ],
}

crime_types = [
    "Stalking", "Theft", "Robbery", "Assault", "Burglary",
    "Fraud", "Cybercrime", "Vandalism", "Domestic Violence"
]

# Generate slight variations of coordinates
def generate_variations(points):
    modifiers = [
        (0.0001, 0.0001), (0.0001, -0.0001),
        (-0.0001, 0.0001), (-0.0001, -0.0001),
        (0.0002, 0.0002), (-0.0002, -0.0002),
        (0.0003, 0.0003), (-0.0003, -0.0003),
    ]
    variations = set()
    for lat, lon in points:
        for mod in modifiers:
            variations.add((round(lat + mod[0], 6), round(lon + mod[1], 6)))
    return list(variations)

# Generate unique variations for each city upfront
city_variations = {city: generate_variations(coords) for city, coords in city_coordinates.items()}

# Generate random datetime
def random_date(start, end):
    delta = end - start
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start + timedelta(seconds=random_seconds)

# Set to keep track of used coordinates (lat, lon)
used_coordinates = set()

# Generate dataset
data = []
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 12, 10)

for i in range(1, 100):  # Adjust number of rows here
    city = random.choice(list(city_coordinates.keys()))
    lat, lon = random.choice(city_variations[city])

    # Ensure unique lat, lon pairs
    while (lat, lon) in used_coordinates:
        lat, lon = random.choice(city_variations[city])  # Select new coordinates if already used
    used_coordinates.add((lat, lon))  # Add the unique lat, lon to the set

    record = {
        "id": i,
        "crime_type": random.choice(crime_types),
        "latitude": lat,
        "longitude": lon,
        "timestamp": random_date(start_date, end_date).strftime("%Y-%m-%d %H:%M:%S"),
        "age_victim": random.randint(10, 80),
        "city": city,
    }
    data.append(record)

# Save data to JSON file
with open("new_crime_data.json", "w") as f:
    json.dump(data, f, indent=2)

print("Data generated and saved to new_crime_data.json")
