from typing import Dict

from .entity import Entity


class EntityMetricValues:
    """
    stores metric values for an entity that is part of a snapshot
    """

    def __init__(self, entity_name: str, kind: str, file: str):
        """
        initialization
        :param entity_name: name of the entity, could be name of a file or class or method
        :param kind: kind of entity (file, class, namespace/package etc...)
        """
        self.entity = Entity(entity_name, kind, file)
        self.metric_values: Dict[str, float] = {}

    def add_metric_value(self, metric_id: str, metric_value: float):
        """
        assigns a metric value to this entity
        :param metric_id: id used to identify the metric
        :param metric_value: the metric value that was calculated for this entity
        :return: nothing
        """
        self.metric_values[metric_id] = metric_value
