from .analysis_result import AnalysisResult
from model import repository
from typing import List
import os
import abc


class MetricCollectorBase(abc.ABC):
    """ Base class for processes that collects the metrics from a snapshot."""

    def __init__(self, repository_name: str, repository_language: str, analysis_folder: str, metric_ids: List[str], source_path: str):
        """
        initialization
        :param repository_name: name of the repository for which metrics should be calculated
        :param analysis_folder: folder where the analysis result should be stored
        :param metric_ids: list of metric ids that should be calculated by this collector
        """
        self.analysis_folder = analysis_folder
        self.metric_ids = metric_ids
        self.root_path = os.path.join(analysis_folder, repository_name)
        self.language = repository_language
        self.repository_name = repository_name
        self.source_path = source_path
        if not os.path.exists(self.root_path):
            os.makedirs(self.root_path)

    @abc.abstractmethod
    def collect_metrics(self, snapshot: repository.RepositorySnapshot) -> AnalysisResult:
        pass







