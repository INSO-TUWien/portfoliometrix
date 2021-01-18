from injector import inject
from backend_application.repository import DatabaseRepository
from typing import List


class TrendService:

    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    """
    returns the trend for the given project and metrics
    TODO: later this method will get a config parameter to configure timeline, normalization etc...
    """
    def get_trends(self, project_id: str, metric_ids: List[str], options):
        if options['value'] == 'absolute':
            trend_series = self.repository.get_trends(project_id, metric_ids)
        else:
            trend_series = self.repository.get_relative_trends(project_id, metric_ids)
        return {
            'project': project_id,
            'series': trend_series
        }




