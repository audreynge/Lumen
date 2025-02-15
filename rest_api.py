from flask import Flask, request, jsonify
import pandas as pd
from scipy import stats
import subprocess
import json
from pymongo import MongoClient
from bson import json_util

app = Flask(__name__)

@app.route('/issue')
def add_service_issue():
    """
    rest api arguments:
        category - category of issue (outage, delay, etc)
        description - description of issue
        address - address of issue - try to be exact
        line - line that issue occurred on (ex: green)
    :return:
        the mongodb object returned when the data is inserted

    example usage (ALL ONE LINE): http://127.0.0.1:5000/issue?category=apocalypse&
        description=THE%20END%20IS%20UPON%20US&address=650%20Columbus%20Avenue&line=green
    """
    category = request.args.get('category')
    description = request.args.get('description')
    address = request.args.get('address')
    line = request.args.get('line')

    client = MongoClient(
        'mongodb://localhost:27017'
    )

    db = client['mbta']
    col = db['service_issues']

    print('mongo setup done')

    data = {
        'category': category,
        'description': description,
        'address': address,
        'line': line
    }

    _ = col.insert_one(data)
    return json.loads(json_util.dumps(data))