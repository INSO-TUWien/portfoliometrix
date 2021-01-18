from pyArango.collection import Collection, Field, Edges
from pyArango.graph import Graph, EdgeDefinition


class Repository(Collection):
    _fields = {
        "name": Field(),
        "description": Field(),
        "full_name": Field(),
        "language": Field(),
        "home_page": Field(),
        # Base URL to access GitHub HTML pages for this repository
        "html_url": Field()
    }


class Metric(Collection):
    _fields = {
        "name": Field(),
        "description": Field()
    }


class Portfolio(Collection):
    _fields = {
        "name": Field(),
        "description": Field()
    }


class Snapshot(Collection):
    pass


class Entity(Collection):
    _fields = {
        "name": Field(),
        "kind": Field(),
        "file": Field()
    }


# one edge collection for every metric?
class MetricValue(Edges):
    _fields = {
        "metric": Field(),
        "value": Field()
    }


# edge between Repository and entity
class EntityInRepository(Edges):
    pass


# edge between Snapshot and Repository
class SnapshotOfRepository(Edges):
    pass


# edge between a health indicator and a metric
class MetricRule(Edges):
    _fields = {
        'lower_threshold': Field(),
        'upper_threshold': Field(),
        # whether the threshold should be applied
        # on SUM, AVG, MED, MIN or MAX
        'aggregate': Field(),
        'affects_health': Field()
    }


# an indicator stores metric rules for either a portfolio or a project
class HealthIndicator(Collection):
    _fields = {
        'name': Field()
    }


class HealthIndicatorForRepository(Edges):
    pass


class HealthIndicatorForPortfolio(Edges):
    pass


class SnapshotSummary(Edges):
    """stores the aggregated metrics for one snapshot.
    After all metrics are collected, external aql scripts are executed that
    aggregate the metrics."""
    _fields = {
        'value': Field()
    }


# edge between repository and portfolio
class RepositoryInPortfolio(Edges):
    pass


class Distribution(Collection):
    pass


class MetricAnalysis(Graph):
    _edgeDefinitions = [
        EdgeDefinition(MetricValue.__name__, fromCollections=[Entity.__name__], toCollections=[Snapshot.__name__]),
        EdgeDefinition(EntityInRepository.__name__, fromCollections=[Entity.__name__], toCollections=[Repository.__name__]),
        EdgeDefinition(SnapshotOfRepository.__name__, fromCollections=[Snapshot.__name__], toCollections=[Repository.__name__]),
        EdgeDefinition(RepositoryInPortfolio.__name__, fromCollections=[Portfolio.__name__], toCollections=[Repository.__name__]),
        EdgeDefinition(SnapshotSummary.__name__, fromCollections=[Snapshot.__name__], toCollections=[Metric.__name__]),
        EdgeDefinition(MetricRule.__name__, fromCollections=[HealthIndicator.__name__], toCollections=[Metric.__name__]),
        EdgeDefinition(HealthIndicatorForPortfolio.__name__, fromCollections=[HealthIndicator.__name__], toCollections=[Portfolio.__name__]),
        EdgeDefinition(HealthIndicatorForRepository.__name__, fromCollections=[HealthIndicator.__name__], toCollections=[Repository.__name__])
    ]
    _orphanedCollections = [
        Distribution.__name__
    ]
