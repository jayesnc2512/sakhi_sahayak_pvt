import json
import random
from datetime import datetime, timedelta

# Define the base coordinates for Mumbai
base_coordinates = [
        (19.230089, 72.966235),
        (19.186970, 72.994888),
        (19.184051, 73.009317),
        (19.149352, 72.992826),
        (19.162649, 73.024090),
        (19.266781, 72.965067),
        (19.235989, 72.992208)
]

# Function to generate random crime data
def generate_crime_data(num_records):
    crime_data = []
    crime_types = ["Theft", "Robbery", "Assault", "Burglary", "Vandalism"]
    
    for i in range(num_records):
        # Select a random base coordinate
        base_lat, base_lon = random.choice(base_coordinates)
        
        # Generate random latitude and longitude by adding/subtracting a small random value
        lat_variation = random.uniform(-0.01, 0.01)
        lon_variation = random.uniform(-0.01, 0.01)
        
        latitude = round(base_lat + lat_variation, 6)
        longitude = round(base_lon + lon_variation, 6)
        
        # Generate a random timestamp
        timestamp = (datetime.now() - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d %H:%M:%S")
        
        # Generate a random age for the victim
        age_victim = random.randint(18, 65)
        
        # Create a crime record
        crime_record = {
            "id": i + 401,
            "crime_type": random.choice(crime_types),
            "latitude": latitude,
            "longitude": longitude,
            "timestamp": timestamp,
            "age_victim": age_victim,
            "city": "thane"
        }
        
        crime_data.append(crime_record)
    
    return crime_data

# Generate 100 records of crime data
crime_records = generate_crime_data(315)

# Save the data to a JSON file
with open('mumbai_crime_data.json', 'w') as json_file:
    json.dump(crime_records, json_file, indent=4)

print("Crime data generated and saved to mumbai_crime_data.json")