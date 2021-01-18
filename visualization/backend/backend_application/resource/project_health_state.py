from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields
from webargs.flaskparser import use_kwargs
from backend_application.service import HealthStateService


class ProjectHealthState(Resource):

    @inject
    def __init__(self, service: HealthStateService):
        self.service = service

    get_args = {
        'project': fields.Str(required=True),
        'indicator': fields.Str(required=True)
    }

    @use_kwargs(get_args, location="query")
    def get(self, project, indicator):
        health_state = self.service.calculate_project_health(project, indicator)
        json_result = jsonify(health_state)
        return json_result
