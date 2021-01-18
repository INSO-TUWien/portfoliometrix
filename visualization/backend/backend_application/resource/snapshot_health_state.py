from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields
from webargs.flaskparser import use_kwargs
from backend_application.service import HealthStateService


class SnapshotHealthState(Resource):

    @inject
    def __init__(self, service: HealthStateService):
        self.service = service

    get_args = {
        'portfolio': fields.Str(required=True)
    }
    @use_kwargs(get_args, location="query")
    def get(self, portfolio):
        health_state = self.service.calculate_health_state_for_all_snapshots(portfolio)
        json_result = jsonify(health_state)
        return json_result
