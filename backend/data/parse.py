# import json

# # Load the JSON data
# with open("coordinates.json", "r") as file:  # Replace 'data.json' with your file name
#     data = json.load(file)

# # Parse and format the data
# easy_coordinates = {}
# for feature in data["features"]:
#     city = feature["properties"]["NAME_3"]
#     coordinates = feature["geometry"]["coordinates"]
#     easy_coordinates[city] = {
#         "coordinates": coordinates
#     }

# # Save the result as a JSON file
# with open("easy_coordinates.json", "w") as output_file:
#     json.dump(easy_coordinates, output_file, indent=4)

# print("Parsed data saved to 'easy_coordinates.json'")
import json

# Load the data from eay_coordinates.json
with open('easy_coordinates.json', 'r') as file:
    data = json.load(file)

# Function to swap the coordinates (to handle nested lists of coordinates)
def swap_coordinates(coordinates):
    # If coordinates are in the format of [[lat, lon]], swap them
    if isinstance(coordinates[0][0], list):
        return [[coord[1], coord[0]] for coord in coordinates[0]]  # Swap lat/lon to lon/lat
    # If coordinates are just a single pair (lat, lon), swap them
    elif len(coordinates) == 2:
        return [coordinates[1], coordinates[0]]
    return coordinates

# Iterate over the data and swap coordinates
for key, value in data.items():
    if isinstance(value, dict) and 'coordinates' in value:
        value['coordinates'] = [swap_coordinates(coord) for coord in value['coordinates']]

# Save the updated data back to easy_coordinates_updated.json
with open('easy_coordinates_updated.json', 'w') as file:
    json.dump(data, file, indent=4)

print("Coordinates swapped successfully!")


