import json
import geopy.distance
import numpy as np
from sklearn.cluster import DBSCAN

def load_json_data(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def haversine_distance(lat1, lon1, lat2, lon2):
    return geopy.distance.geodesic((lat1, lon1), (lat2, lon2)).meters

def cluster_data(input_data, eps=500):
    coordinates = [(entry['latitude'], entry['longitude']) for entry in input_data]

    coordinates_array = np.array(coordinates)

    db = DBSCAN(eps=eps / 6371000.0, min_samples=1, metric='haversine') 
    cluster_labels = db.fit_predict(np.radians(coordinates_array))  

    for i, entry in enumerate(input_data):
        entry['cluster'] = int(cluster_labels[i]) if cluster_labels[i] != -1 else 'noise'

    return input_data

def save_json_data(data, file_path):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=2)

def main(input_file, output_file):
    data = load_json_data(input_file)

    clustered_data = cluster_data(data)

    save_json_data(clustered_data, output_file)

    print(f"Updated data saved to {output_file}")

input_file = 'crime_data.json' 
output_file = 'updated_crime_data1.json'  

main(input_file, output_file)
