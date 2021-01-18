from injector import inject
from backend_application.repository import DatabaseRepository


class MetricsService:

    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    def get_metrics(self):
        return self.repository.get_metrics()