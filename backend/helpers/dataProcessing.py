import pandas as pd
import os
from geopy.geocoders import Nominatim

class DataProcessor:
    def __init__(self):
        self.crimes_file = 'data/crime_data.csv'
        self.cities_file = 'data/cities.csv'
        self.geolocator = Nominatim(user_agent="crime_hotspot_app")
        
    def load_crimes_data(self):
        if os.path.exists('data/crimes_processed.csv'):
            return pd.read_csv('data/crimes_processed.csv')
        else:
            crimes = pd.read_csv(self.crimes_file)
            crimes = self.process_crimes_data(crimes)
            crimes.to_csv('data/crimes_processed.csv', index=False)
            return crimes

    def load_cities_data(self):
        cities = pd.read_csv(self.cities_file)
        return cities
    
    def process_crimes_data(self, crimes_df):
        # Perform necessary data preprocessing
        crimes_df['Date Reported'] = pd.to_datetime(crimes_df['Date Reported'], format='%d-%m-%Y %H:%M', errors='coerce')
        return crimes_df
    
    def calculate_hotspot_cities(self):
        crimes_df = self.load_crimes_data()
        crimes_by_city = crimes_df.groupby('City').size().reset_index(name='Crime Count')
        crimes_by_city['Hotspot'] = crimes_by_city['Crime Count'] > crimes_by_city['Crime Count'].quantile(0.8)
        
        cities_df = self.load_cities_data()
        hotspot_cities = crimes_by_city[crimes_by_city['Hotspot'] == True]
        
        # Merge crime data with city latitudes and longitudes
        city_hotspot_info = pd.merge(hotspot_cities, cities_df, left_on='City', right_on='name')
        hotspots = city_hotspot_info[['City', 'Crime Count', 'latitude', 'longitude']].to_dict(orient='records')
        return hotspots
    
    def get_city_stats(self, city_name):
        crimes_df = self.load_crimes_data()
        city_data = crimes_df[crimes_df['City'] == city_name]
        total_crimes = city_data.shape[0]
        crime_types = city_data['Crime Description'].value_counts().to_dict()
        
        city_stats = {
            "Total Crimes": total_crimes,
            "Crime Types": crime_types
        }
        return city_stats
    
    def get_crime_data(self):
        crimes_df = self.load_crimes_data()
        return crimes_df[['City', 'Crime Description', 'Date Reported']].to_dict(orient='records')
