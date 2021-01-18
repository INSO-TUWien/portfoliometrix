from injector import inject
from backend_application.repository import DatabaseRepository


class SnapshotService:
    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    def get_snapshots_by_projects(self, project_key):
        return self.repository.get_snapshots_for_project(project_key)
