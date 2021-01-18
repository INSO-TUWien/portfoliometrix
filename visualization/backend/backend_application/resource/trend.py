from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields
from webargs.flaskparser import use_kwargs
from backend_application.service import TrendService



class Trend(Resource):

    @inject
    def __init__(self, trend_service: TrendService):
        self.trend_service = trend_service

    args = {
        'project': fields.Str(required=True),
        'metrics': fields.List(fields.Str()),
        'controls': fields.Str()
    }
    @use_kwargs(args, location="query")
    def get(self, project, metrics, controls):
        options = json.loads(controls)
        series = self.trend_service.get_trends(project, metrics, options)
        json_result = jsonify(series)
        return json_result
