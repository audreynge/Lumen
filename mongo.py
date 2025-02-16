"""
create the database & collection to be used, and insert some test data
"""

from pymongo import MongoClient

client = MongoClient(
    'mongodb://localhost:27017'
)

db = client['mbta']
col = db['service_issues']
col.create_index([("location", "2dsphere")])
col.drop()
print(db.list_collection_names())

latitude = 40.7128  # Example: New York City
longitude = -74.0060

# Create the GeoJSON Point object
location = {
    "type": "Point",
    "coordinates": [longitude, latitude]
}

# Create the document to insert
document = {
    'category': 'outage',
    'description': 'WALLAHI I AM FINISHED',
    "location": location,
    'line': 'green'
}

# Insert the document into the collection
result = col.insert_one(document)

cursor = col.find()
for entry in cursor:
    print(entry)

