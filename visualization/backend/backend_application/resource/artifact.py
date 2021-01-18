from flask import jsonify, json
from flask_restful import Resource
from injector import inject
from webargs import fields
from webargs.flaskparser import use_kwargs
from backend_application.service import ArtifactService


class Artifact(Resource):

    @inject
    def __init__(self, service: ArtifactService):
        self.service = service

    args = {
        'snapshot': fields.Integer(),
        'projects': fields.List(fields.Str()),
        'metric': fields.Str(),
        'filter': fields.Str()
    }
    @use_kwargs(args, location="query")
    def get(self, snapshot, projects, metric, filter):
        artifacts = self.service.get_artifacts_for_snapshot(snapshot, projects, metric, filter)
        json_result = jsonify(artifacts)
        return json_result
