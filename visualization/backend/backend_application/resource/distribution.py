from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields
from webargs.flaskparser import use_kwargs
from backend_application.service import DistributionService


class Distribution(Resource):

    @inject
    def __init__(self, service: DistributionService):
        self.service = service

    args = {
        'projects': fields.List(fields.Str()),
        'metric': fields.Str(),
        'filter': fields.Str()
    }
    @use_kwargs(args, location="query")
    def get(self, projects, metric, filter):
        distributions = self.service.get_distributions(projects, metric, filter)
        json_result = jsonify(distributions)
        return json_result
