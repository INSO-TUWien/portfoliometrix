from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields
from webargs.flaskparser import use_kwargs
from backend_application.service import PolarChartService


class PolarChart(Resource):

    @inject
    def __init__(self, service: PolarChartService):
        self.service = service

    args = {
        'projects': fields.List(fields.Str()),
        'metrics': fields.List(fields.Str())
    }
    @use_kwargs(args, location="query")
    def get(self, projects, metrics):
        polar_chart_data = self.service.get_polar_chart_data(projects, metrics)
        json_result = jsonify(polar_chart_data)
        return json_result
