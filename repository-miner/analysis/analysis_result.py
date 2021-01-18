import datetime
from typing import List
from .metrics_for_entity import EntityMetricValues
from .entity import Entity
from model import RepositorySnapshot
from collections import defaultdict


class AnalysisResult:
    """
    The result of an analysis process.
    Contains all entities which were part of the analyzed snapshot.
    For each entity, all calculated metric values are stored
    """
    def __init__(self, snapshot: RepositorySnapshot):
        self.snapshot = snapshot
        self.metrics_per_entity: List[EntityMetricValues] = []

    def add_entity_metrics(self, entity_metric_values: EntityMetricValues):
        """
        adds a new entity and its metric values to the analysis result
        :param entity_metric_values:
        :return:
        """
        self.metrics_per_entity.append(entity_metric_values)


class RepositoryAnalysis:
    """
    stores all metric analysis for a repository.
    Used to write all results in a bulk operation to the DB
    """
    def __init__(self, repository_key: str):
        self.repository_key = repository_key
        self.results: List[AnalysisResult] = []

    def add_snapshot_result(self, snapshot_result: AnalysisResult):
        self.results.append(snapshot_result)

    def get_all_entities(self) -> List[Entity]:
        entities = list(set([entities_and_metrics.entity
                        for result in self.results
                        for entities_and_metrics in result.metrics_per_entity]))
        return entities

    def get_all_snapshots(self) -> List[RepositorySnapshot]:
        snapshots = [result.snapshot for result in self.results]
        return snapshots


