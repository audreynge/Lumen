"""
create the database & collection to be used, and insert some test data
"""

from pymongo import MongoClient

client = MongoClient(
    'mongodb://localhost:27017'
)

db = client['mbta']
col = db['service_issues']
print(db.list_collection_names())

test_data = {
    'category': 'outage',
    'description': 'A dragon wandered onto the train tracks and ate a train',
    'address': '1600 Pennsylvania Avenue',
    'line': 'green'
}

_ = col.insert_one(test_data)

