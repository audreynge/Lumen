from flask import Flask, request, jsonify
import pandas as pd
from scipy import stats
import json
from pymongo import MongoClient
from bson import json_util
import math
from optimal_neighborhood_path import optimized_path
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/issue')
def add_service_issue():
    """
    rest api arguments:
        category - category of issue (outage, delay, etc)
        description - description of issue
        latitude/longitude - latitude, longitude of issue
        line - line that issue occurred on (ex: green)
    :return:
        the mongodb object returned when the data is inserted

    example usage (ALL ONE LINE): http://127.0.0.1:5000/issue?category=apocalypse&
        description=THE%20END%20IS%20UPON%20US&latitude=42.7&longitude=-71.5&line=green
    """
    category = request.args.get('category')
    description = request.args.get('description')
    latitude, longitude = float(request.args.get('latitude')), float(request.args.get('longitude'))
    line = request.args.get('line')

    client = MongoClient(
        'mongodb://localhost:27017'
    )

    db = client['issues']
    col = db['service_issues']

    location = {
        "type": "Point",
        "coordinates": [longitude, latitude]
    }

    data = {
        'category': category,
        'description': description,
        "location": location,
        'line': line
    }

    _ = col.insert_one(data)
    return json.loads(json_util.dumps(data))

@app.get('/find')
def find_nearby_issues():
    """
    api args:
        latitude: latitude
        longitude: longitude
        radius: radius to search (in meters)
    :return:
        every row where the location matches

    example usage: http://127.0.0.1:5000/find?latitude=42.3604&longitude=-71.058&radius=10000
    """
    client = MongoClient(
        'mongodb://localhost:27017'
    )

    db = client['issues']
    col = db['service_issues']

    center_latitude = float(request.args.get('latitude'))  # Example: New York City
    center_longitude = float(request.args.get('longitude'))
    radius_in_meters = int(request.args.get('radius')) # meters

    # convert radius to radians
    earth_radius_in_meters = 6371000 # rough estimate
    radius_in_radians = radius_in_meters / earth_radius_in_meters

    # geospatial query
    query = {
        "location": {
            "$geoWithin": {
                "$centerSphere": [[center_longitude, center_latitude], radius_in_radians]
            }
        }
    }

    results = col.find(query)
    return json.loads(json_util.dumps(results))

@app.get('/path')
def get_optimized_path():
    """
    api args:
        start - start address
        end - end address
    :return:
        json with 2 fields:
        "stops" which has all MBTA stops along the optimized path, in order of traversal
        "latlons" which has tuples (latitude, longitude) along the optimized path in order

    example usage (ALL ONE LINE): http://127.0.0.1:5000/path?start=1%20Science%20Pk,%20Boston,%20MA
    &end=963%20South%20St,%20Roslindale,%20MA
    """
    start = request.args.get('start')
    end = request.args.get('end')

    out = optimized_path(start, end)
    return jsonify(out)