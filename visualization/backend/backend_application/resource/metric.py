from flask_restful import Resource
from flask import jsonify
from injector import inject
from backend_application.service import MetricsService


class Metric(Resource):

    @inject
    def __init__(self, metric_service: MetricsService):
        self.metric_service = metric_service

    """
    returns all available metrics
    """
    def get(self):
        metrics = self.metric_service.get_metrics()
        result = jsonify([{'id': m['_key'], 'name': m['name'], 'description': m['description']} for m in metrics])
        return result
