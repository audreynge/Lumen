# Install required libraries if you haven't already
# pip install osmnx geopandas matplotlib networkx

import os
import osmnx as ox
import networkx as nx
import geopandas as gpd
import matplotlib.pyplot as plt

# Step 1: Download Boston's street network
G = ox.graph_from_place("Boston, Massachusetts, USA", network_type="all_public")

# Step 2: Load BPDA neighborhood boundaries
gdf_neighborhoods = gpd.read_file('bpda_neighborhood_boundaries/BPDA_Neighborhood_Boundaries.shp')

# Inspect the columns to find the neighborhood name column
print("Columns in gdf_neighborhoods:", gdf_neighborhoods.columns)

# Step 3: Simplify and prepare data
gdf_neighborhoods = gdf_neighborhoods.to_crs(epsg=4326)  # Ensure CRS is WGS84
gdf_neighborhoods["geometry"] = gdf_neighborhoods["geometry"].simplify(tolerance=0.001)

# Reproject the graph to match the neighborhoods' CRS
G = ox.project_graph(G, to_crs=gdf_neighborhoods.crs)
print(list(G.edges(data=True))[0])

# Step 4: Get edges as a GeoDataFrame
gdf_edges = ox.graph_to_gdfs(G, nodes=False, edges=True, fill_edge_geometry=True)
gdf_edges = gdf_edges.reset_index() # move u and v to actual columns
# gdf_edges["u"] = [edge[0] for edge in G.edges]  # Source nodes
# gdf_edges["v"] = [edge[1] for edge in G.edges]  # Target nodes
print("Columns in gdf_edges:", gdf_edges.columns)
print(gdf_edges.head().to_string())

# Step 5: Perform a spatial join to find which streets are in each neighborhood
gdf_joined = gpd.sjoin(gdf_edges, gdf_neighborhoods, how="inner", predicate="intersects")

# Inspect the columns in gdf_joined
print("Columns in gdf_joined:", gdf_joined.columns)

# Step 6: Create a dictionary to map street edges to neighborhoods
neighborhood_connections = {}

for _, row in gdf_joined.iterrows():
    neighborhood = row["name_right"]  # Replace "Name" with the correct column name
    edge = (row["u"], row["v"])  # Edge in the street network

    if edge not in neighborhood_connections:
        neighborhood_connections[edge] = set()
    neighborhood_connections[edge].add(neighborhood)

# Step 7: Create a graph of neighborhood connectivity
neighborhood_graph = nx.Graph()

for edge, neighborhoods in neighborhood_connections.items():
    neighborhoods = list(neighborhoods)
    for i in range(len(neighborhoods)):
        for j in range(i + 1, len(neighborhoods)):
            neighborhood_graph.add_edge(neighborhoods[i], neighborhoods[j])

# Step 8: Visualize the neighborhood connectivity graph
# pos = nx.spring_layout(neighborhood_graph)
# nx.draw(neighborhood_graph, pos, with_labels=True, node_color="lightblue", edge_color="gray")
# plt.show()

# Step 9: Print connected neighborhoods
for edge in neighborhood_graph.edges:
    print(f"{edge[0]} is connected to {edge[1]}")

neighborhoods_folder = 'neighborhood_files_cleaned'
try:
    os.mkdir(neighborhoods_folder)
except:
    print(f'{neighborhoods_folder} already exists')

# Optional: Save the graph as a shapefile or GeoJSON
gdf_joined.to_file(f"{neighborhoods_folder}/neighborhood_connectivity.shp")