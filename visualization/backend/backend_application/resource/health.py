from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields


class Health(Resource):

    def get(self):
        json_result = jsonify({'health': 'Server is running'})
        return json_result