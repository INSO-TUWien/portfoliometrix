from injector import inject
from backend_application.repository import DatabaseRepository
from typing import List


class RangeService:

    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    """
    returns the value range for the given metrics for all given projects
    """
    def get_range(self, project_ids: List[str], metric_ids: List[str], use_total_values):
        range = self.repository.get_value_range(project_ids, metric_ids, use_total_values)
        return range[0]




