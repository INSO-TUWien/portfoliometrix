from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields
from webargs.flaskparser import use_kwargs
from backend_application.service import HealthIndicatorService


class HealthIndicator(Resource):

    @inject
    def __init__(self, service: HealthIndicatorService):
        self.service = service

    get_args = {
        'portfolio': fields.Str(required=True)
    }

    @use_kwargs(get_args, location="query")
    def get(self, portfolio):
        health_indicators = self.service.get_health_indicators(portfolio)
        json_result = jsonify(health_indicators)
        return json_result

    put_args = {
        'indicator': fields.Str(required=True)
    }
    @use_kwargs(put_args)
    def put(self, indicator):
        indicator_object = json.loads(indicator)
        indicator = self.service.create_or_update_indicator(indicator_object)
        json_result = jsonify(indicator_object)
        return json_result

    delete_args = {
        'indicator_id': fields.Str(required=True)
    }
    @use_kwargs(delete_args, location='query')
    def delete(self, indicator_id):
        self.service.delete_project_health_indicator(indicator_id)
        return
