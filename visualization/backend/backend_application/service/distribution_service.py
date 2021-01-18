from injector import inject
from backend_application.repository import DatabaseRepository
from typing import List
import numpy


class DistributionService:
    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    def get_distributions(self, project_keys: List[str], metric_id: str, filter: str):
        distributions = self.repository.get_distributions_for_project_metric_and_filter(project_keys, metric_id, filter)
        return distributions
