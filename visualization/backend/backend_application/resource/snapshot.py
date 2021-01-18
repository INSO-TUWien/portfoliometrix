from flask import jsonify
from flask_restful import Resource
from injector import inject

from backend_application.service import SnapshotService


class Snapshot(Resource):

    @inject
    def __init__(self, snapshot_service: SnapshotService):
        self.snapshot_service = snapshot_service

    def get(self, project_key):
        result = self.snapshot_service.get_snapshots_by_projects(project_key)
        return jsonify(result)