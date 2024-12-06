import pandas as pd
import os
import json

class DataProcessor:
    crimes_file = pd.read_csv('data/crime_data.csv')
    cities_file = pd.read_csv('data/cities.csv')
    population_file = pd.read_csv('data/population.csv')
    crime_processed_file=pd.read_csv('data/crime_processed_data.csv')
    
    # Load coordinates from JSON
    with open('data/easy_coordinates.json', 'r') as file:
        coordinates = json.load(file)
    
    @staticmethod
    def aggregate_crimes_data():
    # Count total crimes per city
        crime_counts = DataProcessor.crimes_file.groupby('City').size().reset_index(name='crime_count')
    
    # Count crimes where Victim Gender is 'F' (against women)
        against_women_counts = DataProcessor.crimes_file[DataProcessor.crimes_file['Victim Gender'] == 'F'] \
                                .groupby('City').size().reset_index(name='against_women')

    # Merge the two dataframes on 'City'
        crime_counts = pd.merge(crime_counts, against_women_counts, on='City', how='left')
    
    # Fill any NaN values in 'against_women' with 0 (in case a city has no female victims)
        crime_counts['against_women'].fillna(0, inplace=True)
    
        return crime_counts

        
    @staticmethod
    def merge_population_crime(aggregate_crimes):
        # Select only the CityName and population columns
        population_data = DataProcessor.population_file[['CityName', 'population','admin_name']]
        # Rename the column 'CityName' to 'City' for merging
        population_data = population_data.rename(columns={'CityName': 'City'})
        # Merge the dataframes on 'City'
        merged_data = pd.merge(aggregate_crimes, population_data, on='City', how='left')
        return merged_data

    @staticmethod
    def get_coordinates(data):
        # Function to fetch coordinates for each city
        coordinates_data = DataProcessor.coordinates
        data['coordinates'] = data['City'].apply(lambda city: coordinates_data.get(city, {}).get('coordinates', None))
        return data

    @staticmethod
    def calculate_hotspot_cities():
        aggregate_crimes = DataProcessor.aggregate_crimes_data()
        crime_population = DataProcessor.merge_population_crime(aggregate_crimes)
        crime_population['crime_rate'] = (crime_population['crime_count'] / crime_population['population']) * 100000
        # crime_population=DataProcessor.crime_processed_file
        crime_population_coordinates = DataProcessor.get_coordinates(crime_population)
        return crime_population_coordinates

    @staticmethod
    def get_city_stats( city_name):
        crimes_df = DataProcessor.crimes_file
        city_data = crimes_df[crimes_df['City'] == city_name]
        total_crimes = city_data.shape[0]
        crime_types = city_data['Crime Description'].value_counts().to_dict()
        
        city_stats = {
            "Total Crimes": total_crimes,
            "Crime Types": crime_types
        }
        return city_stats

    @staticmethod
    def get_crime_data():
        crimes_df = DataProcessor.load_crimes_data()
        return crimes_df[['City', 'Crime Description', 'Date Reported']].to_dict(orient='records')
