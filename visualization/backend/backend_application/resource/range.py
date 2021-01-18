from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields
from webargs.flaskparser import use_kwargs
from backend_application.service import RangeService



class Range(Resource):

    @inject
    def __init__(self, range_service: RangeService):
        self.range_service = range_service

    args = {
        'projects': fields.List(fields.Str()),
        'metrics': fields.List(fields.Str()),
        'use_total_values': fields.Boolean()
    }

    @use_kwargs(args, location="query")
    def get(self, projects, metrics, use_total_values):
        range = self.range_service.get_range(projects, metrics, use_total_values)
        json_result = jsonify(range)
        return json_result
