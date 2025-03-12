"""
create the database & collection to be used, and insert some test data
"""

from pymongo import MongoClient

client = MongoClient(
    'mongodb://localhost:27017'
)

db = client['issues']
col = db['service_issues']

# col.create_index([("location", "2dsphere")])
col.drop()
if "location_2dsphere" not in col.index_information():
    col.create_index([("location", "2dsphere")])
print(db.list_collection_names())

latitudes = [40.7128, 42.3604, 42.3500, 42.3402, 42.2300]
longitudes = [-74.0060, -71.0580, -71.0573, -71.0579, -71.0592]

# Create the GeoJSON Point object
locations = [{
    "type": "Point",
    "coordinates": [lon, lat]
} for lat, lon in zip(latitudes, longitudes)]

# Create the document to insert
documents = [
    {
        'category': 'Delay',
        'description': 'Green Line is experiencing delays due to a signal failure near Boylston station.',
        "location": locations[0],
        'line': 'Green'
    },
    {
        'category': 'Outage',
        'description': 'Red Line service is suspended between South Station and Downtown Crossing for emergency track repairs.',
        "location": locations[1],
        'line': 'Red'
    },
    {
        'category': 'Delay',
        'description': 'Orange Line is operating at reduced frequency due to a mechanical issue on the route.',
        "location": locations[2],
        'line': 'Orange'
    },
    {
        'category': 'Outage',
        'description': 'Blue Line service is currently halted due to a power outage affecting several stations.',
        "location": locations[3],
        'line': 'Blue'
    },
    {
        'category': 'Delay',
        'description': 'Orange line is experiencing minor delays due to inclement weather conditions.',
        "location": locations[4],
        'line': 'Orange'
    }
]

# Insert the document into the collection
result = col.insert_many(documents)

cursor = col.find()
for entry in cursor:
    print(entry)



