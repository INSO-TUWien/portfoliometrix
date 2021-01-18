from injector import inject
from backend_application.repository import DatabaseRepository


class ArtifactService:
    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    def get_artifacts_for_snapshot(self, snapshot_index, project_keys, metric_key, filter):
        return self.repository.get_artifacts_for_snapshot(snapshot_index, project_keys, metric_key, filter)