"""
create the database & collection to be used, and insert some test data
"""

from pymongo import MongoClient

client = MongoClient(
    'mongodb://localhost:27017'
)

db = client['mbta']
col = db['service_issues']
# col.create_index([("location", "2dsphere")])
col.drop()
print(db.list_collection_names())

latitudes = [40.7128, 42.3604, 42.3500, 42.3402, 42.2300]  # Example: New York City
longitudes = [-74.0060, -71.0580, -71.0573, -71.0579, -71.0592]

# Create the GeoJSON Point object
locations = [{
    "type": "Point",
    "coordinates": [lat, lon]
} for lat, lon in zip(latitudes, longitudes)]

# Create the document to insert
documents = [
    {
        'category': 'outage',
        'description': 'WALLAHI I AM FINISHED',
        "location": locations[0],
        'line': 'green'
},
    {
        'category': 'outage',
        'description': 'is this thing on',
        "location": locations[1],
        'line': 'red'
    },
    {
        'category': 'delay',
        'description': 'portal to hell opened under city hall',
        "location": locations[2],
        'line': 'red'
    },
    {
        'category': 'outage',
        'description': 'the entire city lost power',
        "location": locations[3],
        'line': 'orange'
    },
    {
        'category': 'delay',
        'description': 'the 7 trumpets sounded',
        "location": locations[4],
        'line': 'blue'
    }
]

# Insert the document into the collection
result = col.insert_many(documents)

cursor = col.find()
for entry in cursor:
    print(entry)

