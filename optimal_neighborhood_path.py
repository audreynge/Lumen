"""
Given data on shootings, find best path from point a to point b
Will try to minimize weight where a neighborhood (node)'s weight is the # of shootings in it
heavy WIP
"""

import time
import osmnx as ox
import networkx as nx
from geopy.geocoders import Nominatim
import geopandas as gpd
import pandas as pd
from shapely.geometry import LineString, Point
import pickle
from shapely.ops import nearest_points

# Step 1: Geocode the addresses
def geocode_address(address):
    geolocator = Nominatim(user_agent="route_planner")
    location = geolocator.geocode(address)
    return (location.latitude, location.longitude)

def calculate_distance_along_path(stop_point, path_line):
    # Find the nearest point on the path to the stop
    nearest_point_on_path = nearest_points(stop_point, path_line)[1]
    # Calculate the distance along the path to the nearest point
    distance_along_path = path_line.project(nearest_point_on_path)
    return distance_along_path

def optimized_path(start, end):
    # sample start = "1 Science Pk, Boston, MA"
    # sample end = "963 South St, Roslindale, MA"
    start_address = start
    end_address = end # test addresses of certain landmarks

    start_point = geocode_address(start_address)
    end_point = geocode_address(end_address)

    # assign weights to neighborhoods based on shootings
    df = pd.read_csv('shootings.csv')
    neighborhood_weights = df['NEIGHBORHOOD'].value_counts().to_dict()

    # will pickle on first run, speeding up future runs
    try:
        with open("boston_graph.pickle", "rb") as f:
            G = pickle.load(f)
    except:
        G = ox.graph_from_place("Boston, Massachusetts, USA", network_type="all")

        gdf_neighborhoods = gpd.read_file('bpda_neighborhood_boundaries/BPDA_Neighborhood_Boundaries.shp')

        # match crs
        gdf_neighborhoods = gdf_neighborhoods.to_crs(epsg=4326)

        # assign neighborhood weights to edges
        for u, v, data in G.edges(data=True):
            edge_geometry = data.get("geometry", None)
            if edge_geometry:
                # Find which neighborhoods the edge intersects
                intersecting_neighborhoods = gdf_neighborhoods[gdf_neighborhoods.intersects(edge_geometry)]
                if not intersecting_neighborhoods.empty:
                    # Assign the maximum weight of the intersecting neighborhoods
                    max_weight = max(
                        neighborhood_weights.get(name, 1)  # Default weight = 1 if neighborhood not in the dictionary
                        for name in intersecting_neighborhoods["name"]  # Replace "name" with the correct column
                    )
                    data["weight"] = max_weight
                else:
                    # If the edge doesn't intersect any neighborhoods, assign a default weight
                    data["weight"] = 1
            else:
                # If the edge has no geometry, assign a default weight
                data["weight"] = 1

        with open("boston_graph.pickle", "wb") as f:
            pickle.dump(G, f)


    # find the nearest nodes to the start and end points
    start_node = ox.distance.nearest_nodes(G, start_point[1], start_point[0])
    end_node = ox.distance.nearest_nodes(G, end_point[1], end_point[0])

    # find the shortest path that minimizes the total weight
    shortest_path = nx.shortest_path(G, start_node, end_node, weight="weight")

    # below is all to show path
    # get stops for MBTA
    stops_df = pd.read_csv('mbta_gtfs_data/stops.txt')

    # convert the shortest path into a LineString
    path_coords = [(G.nodes[node]["x"], G.nodes[node]["y"]) for node in shortest_path]
    path_line = LineString(path_coords)

    # create a GeoDataFrame for the path
    gdf_path = gpd.GeoDataFrame(geometry=[path_line], crs="EPSG:4326")

    # create a GeoDataFrame for the MBTA stops
    gdf_stops = gpd.GeoDataFrame(
        stops_df,
        geometry=gpd.points_from_xy(stops_df["stop_lon"], stops_df["stop_lat"]),
        crs="EPSG:4326"
    )

    # find stops within a certain distance of the path, weird encoding is needed
    gdf_path_projected = gdf_path.to_crs(epsg=32619)  # UTM zone 19N
    gdf_stops_projected = gdf_stops.to_crs(epsg=32619)  # UTM zone 19N

    # find stops within a certain distance of the path (e.g., 500 meters)
    distance_threshold = 100  # Distance in meters
    gdf_stops_near_path = gdf_stops_projected[gdf_stops_projected.distance
                                              (gdf_path_projected.union_all()) <= distance_threshold]
    gdf_stops_near_path = gdf_stops_near_path.drop_duplicates(subset=["stop_name"])

    path_line_projected = gdf_path_projected.geometry.iloc[0]

    # Calculate distance along the path for each stop and sort
    gdf_stops_near_path['distance_along_path'] = gdf_stops_near_path.geometry.apply(
        lambda geom: path_line_projected.project(geom)
    )
    gdf_stops_sorted = gdf_stops_near_path.sort_values('distance_along_path')

    # Extract ordered stop names
    stop_names = gdf_stops_sorted['stop_name'].tolist()
    stop_latlons = [(lat, lon) for lat, lon in
                    zip(gdf_stops_sorted['stop_lat'].tolist(), gdf_stops_sorted['stop_lon'].tolist())]

    out = {'names': stop_names, 'latlons': stop_latlons}
    return out

def main():
    start = "1 Science Pk, Boston, MA"
    end = "963 South St, Roslindale, MA"
    _ = optimized_path(start, end)
    print(_)

if __name__ == '__main__':
    main()