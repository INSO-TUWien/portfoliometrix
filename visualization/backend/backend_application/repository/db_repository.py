from pyArango.connection import Connection, Database
from .db_config import ARANGODB
from typing import List

# names used to access document collections
GRAPH_NAME = 'MetricAnalysis'
PORTFOLIO_NAME = 'Portfolio'
REPOSITORY_NAME = 'Repository'
HEALTH_INDICATOR_NAME = 'HealthIndicator'
PORTFOLIO_HEALTH_INDICATOR_NAME = 'HealthIndicatorForPortfolio'
REPOSITORY_HEALTH_INDICATOR_NAME = 'HealthIndicatorForRepository'
METRIC_NAME = 'Metric'
METRIC_RULE_NAME = 'MetricRule'


class DatabaseRepository:
    """
    access to the ArangoDB.
    Normally, one would have one repository per
    entity, but at the moment one single repository
    should be enough for the DB access
    """

    def __init__(self):
        connection = Connection(arangoURL=ARANGODB.URL,
                                username=ARANGODB.USER,
                                password=ARANGODB.PASSWORD)
        if not connection.hasDatabase(ARANGODB.DB_NAME):
            print(f"""
            Error: Database with name {ARANGODB.DB_NAME} not found. 
            Please check your database configuration and create a database first.
            """)
            return
        self.database = connection[ARANGODB.DB_NAME]
        self.database.reloadCollections()

    def get_range_by_project_and_snapshot(self, project_ids, metric_ids):
        """collects the min/max aggregate values over all snapshots for the given metrics, organized by
        projects.
        These values are used to normalize the aggregate values which are retrieved later per snapshot.
        Currently, only sum and median are supported
        """
        project_string_list = map(lambda x: f'"{x}"', project_ids)
        metric_string_list = map(lambda x: f'"{x}"', metric_ids)
        aql = f"""
        FOR entry in (
            FOR metric_key IN [{','.join(metric_string_list)}]
            FOR repository IN Repository FILTER repository._key IN [{','.join(project_string_list)}] 
            FOR snapshot IN 1..1 INBOUND repository._id SnapshotOfRepository
            FOR metric, value IN 1..1 OUTBOUND snapshot._id SnapshotSummary
            FILTER metric_key == metric._key
            RETURN {{
                project: repository._key,
                metric: metric_key,
                sum_value: value.sum_value,
                median_value: value.median_value
            }}
        )
        COLLECT project = entry.project, metric = entry.metric INTO by_metric_and_project
        RETURN {{
            project: project,
            metric: metric,
            sum: {{
                // values: by_metric_and_project[*].entry.sum_value,
                min: MIN(by_metric_and_project[*].entry.sum_value),
                max: MAX(by_metric_and_project[*].entry.sum_value),
                max_minus_min: MAX(by_metric_and_project[*].entry.sum_value) - MIN(by_metric_and_project[*].entry.sum_value)
            }},
            median: {{
                // values: by_metric_and_project[*].entry.median_value,
                min: MIN(by_metric_and_project[*].entry.median_value),
                max: MAX(by_metric_and_project[*].entry.median_value),
                max_minus_min: MAX(by_metric_and_project[*].entry.median_value) - MIN(by_metric_and_project[*].entry.median_value)
            }}
        }}
        """
        result = self.__execute_query(aql)
        return result

    def get_metric_values_by_project_and_snapshot(self, project_ids, metric_ids):
        """collects the values of the given metrics for all snapshots.
        Every snapshot entry contains a list of projects and every project contains
        the metric values"""
        project_string_list = map(lambda x: f'"{x}"', project_ids)
        metric_string_list = map(lambda x: f'"{x}"', metric_ids)
        aql = f"""
        FOR entry2 IN (
            FOR entry in (
                FOR metric_key IN [{','.join(metric_string_list)}]
                FOR repository IN Repository FILTER repository._key IN [{','.join(project_string_list)}] 
                FOR snapshot IN 1..1 INBOUND repository._id SnapshotOfRepository
                FOR metric, value IN 1..1 OUTBOUND snapshot._id SnapshotSummary
                FILTER metric_key == metric._key
                RETURN {{
                    index: snapshot.index,
                    project: repository._key,
                    metric: {{
                        metric_id: metric_key,
                        sum_value: value.sum_value,
                        median_value: value.median_value
                    }}
                }}
            )
            COLLECT index = entry.index, project = entry.project INTO by_index_and_project
            RETURN {{
                index: index,
                data: {{
                    project: project,
                    series: by_index_and_project[*].entry.metric
                }}
            }}
        )
        COLLECT index = entry2.index INTO by_index
        RETURN {{
            snapshot: index,
            data: by_index[*].entry2.data
        }}
        """
        result = self.__execute_query(aql)
        return result

    def get_artifacts_for_snapshot(self, snapshot, project_ids, metric_id, filter):
        project_string_list = map(lambda x: f'"{x}"', project_ids)
        aql = f"""
        FOR entry IN (
            FOR project IN Repository FILTER project._key IN [{','.join(project_string_list)}]
            FOR snapshot IN 1..1 INBOUND project SnapshotOfRepository FILTER snapshot.index == {snapshot}
            FOR entity, metric_value IN 1..1 INBOUND snapshot MetricValue
            FILTER metric_value.metric == '{metric_id}'
            FILTER entity.kind == '{filter}'
            SORT metric_value.value DESC
            RETURN {{
                project: project._key,
                entity: {{
                    name: entity.name,
                    value: metric_value.value,
                    type: "{filter}",
                    url: CONCAT(project.html_url, "/blob/", snapshot._key, "/", entity.file)
                }}
            }}
        )
        COLLECT project = entry.project INTO by_project
        RETURN {{
            project: project, 
            entities: by_project[*].entry.entity
        }}
        """
        result = self.__execute_query(aql)
        return result

    def get_distributions_for_project_metric_and_filter(self, project_ids: List[str], metric_id: str, filter: str):
        project_string_list = map(lambda x: f'"{x}"', project_ids)
        aql = f"""
        FOR result in (
            FOR snapshot in Distribution 
                FOR metric in snapshot.metrics FILTER metric.id == "{metric_id}"
                    FOR project in metric.projects FILTER project.kind == "{filter}" AND project.id IN [{','.join(project_string_list)}]
                    RETURN {{
                        snapshot: snapshot._key,
                        project: {{
                            id: project.id,
                            values: project.values
                        }}
                    }}
        )
        COLLECT snapshot = result.snapshot INTO by_snapshot
        RETURN {{
            snapshot: snapshot,
            projects: by_snapshot[*].result.project
        }}
        """
        result = self.__execute_query(aql)
        return result


    def __execute_query(self, query, bind_vars={}):
        query_result = self.database.AQLQuery(query, rawResults=True, batchSize=500, bindVars=bind_vars)
        result = []
        for entry in query_result:
            if not entry:
                break
            result.append(entry)
        return result

    def collect_indicators_per_project(self, portfolio_id):
        """returns a list that contains a project id and for every project
        the corresponding indicator. If a project does not have an individual indicator,
        the global portfolio indicator will be used."""
        aql = f"""
        FOR portfolio IN Portfolio FILTER portfolio._key == '{portfolio_id}'
            LET portfolio_indicator = FIRST((FOR i IN 1..1 INBOUND portfolio HealthIndicatorForPortfolio RETURN i))
            FOR repository IN 1..1 OUTBOUND portfolio RepositoryInPortfolio
                LET repository_indicator = FIRST((FOR i IN 1..1 INBOUND repository HealthIndicatorForRepository RETURN i))
                LET project_indicator = repository_indicator != null ? repository_indicator : portfolio_indicator
        RETURN {{
            project: repository._key,
            indicator: project_indicator._key
        }}
        """
        return self.__execute_query(aql)

    def get_last_snapshot_indices(self, count):
        """returns the last count snapshot indices from all snapshots.
        Can be used to determine the indices that should be used for calculatin the health index of a project or
        portfolio"""
        aql = f"""
        FOR index IN (
            FOR snapshot in Snapshot
            SORT snapshot.index DESC
            RETURN DISTINCT snapshot.index 
        )
        LIMIT {count} RETURN index
        """
        return self.__execute_query(aql)

    def calculate_health_state_per_snapshot(self, projects_and_indicators, tolerance=0.1):
        """collects the threshold violations for every snapshot"""
        aql = f"""
        FOR result2 in (
            FOR result in (
                FOR entry in @projects_and_indicators
                    LET project = FIRST(FOR p IN Repository FILTER p._key == entry.project RETURN p)
                    LET healthIndicator = FIRST(FOR h IN HealthIndicator FILTER h._key ==  entry.indicator RETURN h)
                    FOR metric, metricRule IN 1..1 OUTBOUND healthIndicator MetricRule
                    FOR snapshot IN 1..1 INBOUND project SnapshotOfRepository 
                    FOR summaryMetric, metricValue IN 1..1 OUTBOUND snapshot SnapshotSummary
                    LET lt = metricRule.lower_threshold
                    LET ut = metricRule.upper_threshold 
                    LET reverse = (lt != null && ut != null) ? ut < lt : false
                    LET distance = reverse ? (ut != null ? ut : lt) : (lt != null ? lt : ut)
                    LET step = distance * @tolerance
                    LET lnt = lt != null ? reverse ? lt - step : lt + step : null // lower notification threshold
                    LET unt = ut != null ? reverse ? ut + step : ut - step : null // upper notification threshold
                    LET value = metricValue[CONCAT(metricRule['aggregate'],'_value')]
                    FILTER summaryMetric == metric
                    RETURN {{
                        project: project._key,
                        snapshot: snapshot.index,
                        data: {{
                            value: value,
                            lower_notification: lt != null ? (reverse ? value >= lnt : value <= lnt ) : false,
                            lower_violation: lt != null ? (reverse ? value >= lt : value <= lt ) : false,
                            upper_notification: ut != null ? (reverse ? value <= unt : value >= unt ) : false,
                            upper_violation: ut != null ? (reverse ? value <= ut : value >= ut ) : false,
                            rule: {{
                                id: metricRule._key,
                                'aggregate': metricRule['aggregate'],
                                metric_id: metric._key,
                                lower_threshold: lt,
                                upper_threshold: ut,
                                affects_health: metricRule.affects_health
                            }}
                        }}
                    }}
                )
                COLLECT snapshot = result.snapshot, project = result.project INTO by_snapshot_and_project
                RETURN {{
                    snapshot: snapshot,
                    project: {{
                        id: project,
                        data: by_snapshot_and_project[*].result.data
                    }}
                }}
        )
        COLLECT snapshot = result2.snapshot INTO by_snapshot
        RETURN {{
            snapshot: snapshot,
            projects: by_snapshot[*].result2.project
        }}
        """
        result = self.__execute_query(aql, {
            'projects_and_indicators': projects_and_indicators,
            'tolerance': tolerance
        })
        return result

    def calculate_health_for_projects(self, projects_and_indicators, snapshot_indices, tolerance=0.1):
        """
        calculates how many of the last snapshot value are violating the indicator's thresholds
        :param portfolio_id: if of the portfolio to analyze
        :param health_indicator_id: indicator for this portfolio
        :param tolerance: tolerance area (0-1) that defines the notification area.
        Example: If the upper threshold is 50 and the tolerance is 0.1 (=10%), then the notification
        area goes from 45 - 50.
        :param recent_snapshot_count: number of snapshots that should be investigated (starting with the newest one)
        :return: a list of objects containing detailed health violation data, organized per project and metric
        """
        aql = f"""
            FOR result IN (
                FOR entry in @projects_and_indicators
                    LET project = FIRST(FOR p IN Repository FILTER p._key == entry.project RETURN p)
                    LET healthIndicator = FIRST(FOR h IN HealthIndicator FILTER h._key ==  entry.indicator RETURN h)
                    FOR metric, metricRule IN 1..1 OUTBOUND healthIndicator MetricRule
                        FOR snapshot IN 1..1 INBOUND project SnapshotOfRepository FILTER snapshot.index IN @snapshot_indices
                        SORT snapshot.index DESC
                            FOR summaryMetric, metricValue IN 1..1 OUTBOUND snapshot SnapshotSummary
                            FILTER summaryMetric == metric
                            RETURN {{
                                project: project,
                                rule: {{
                                    id: metricRule._key,
                                    metric_id: metric._key,
                                    lower_threshold: metricRule.lower_threshold,
                                    upper_threshold: metricRule.upper_threshold,
                                    'aggregate': metricRule['aggregate'],
                                    affects_health: metricRule.affects_health
                                }},
                                data: {{
                                    value: metricValue,
                                    snapshot: snapshot
                                }}
                            }}
            )
            // group result by project and by metric
            COLLECT project = result.project, rule = result.rule INTO grouped
            // check which of the last @snapshot_limit values violates the thresholds
            LET lt = rule.lower_threshold // short cuts
            LET ut = rule.upper_threshold 
            // flag used to check if upper/lower bounds must be changed (only if both thresholds are defined)
            LET reverse = (lt != null && ut != null) ? ut < lt : false
            // using different between lt and ut to calculate the step width does not work, as this would lead to 
            // different results if only one threshold is defined. Instead, the range is defined as the distance between
            // the origin and the lowest threshold value
            // LET distance = ABS(ut - lt)
            LET distance = reverse ? (ut != null ? ut : lt) : (lt != null ? lt : ut)
            LET step = distance * @tolerance //
            LET recent_data = (FOR d IN grouped[*].result.data RETURN d)
            LET snapshot_count = COUNT(@snapshot_indices)            
            LET aggregate_name = CONCAT(rule['aggregate'], '_value')
            // proximity (or notification) thresholds
            LET lnt = lt != null ? reverse ? lt - step : lt + step : null // lower notification threshold
            LET unt = ut != null ? reverse ? ut + step : ut - step : null // upper notification threshold
            // collect the values that are within the different threshold areas
            LET violating_lower_threshold = lt != null ? (reverse ? (FOR data in recent_data FILTER data.value[aggregate_name] >= lt RETURN data) : (FOR data in recent_data FILTER data.value[aggregate_name] <= lt RETURN data.value[aggregate_name])) : []
            LET violating_upper_threshold = ut != null ? (reverse ? (FOR data in recent_data FILTER data.value[aggregate_name] <= ut RETURN data) : (FOR data in recent_data FILTER data.value[aggregate_name] >= ut RETURN data.value[aggregate_name])) : []
            LET notification_lower_threshold = lt != null ? (reverse ? (FOR data in recent_data FILTER data.value[aggregate_name] >= lnt RETURN data) : (FOR data in recent_data FILTER data.value[aggregate_name] <= lnt RETURN data.value[aggregate_name])) : []
            LET notification_upper_threshold = ut != null ? (reverse ? (FOR data in recent_data FILTER data.value[aggregate_name] <= unt RETURN data) : (FOR data in recent_data FILTER data.value[aggregate_name] >= unt RETURN data.value[aggregate_name])) : []

            RETURN {{
                project: project._key,
                metric: rule.metric_id,
                rule: rule.id,
                reverse_thresholds: reverse,
                aggregate_name: rule['aggregate'],
                affects_health: rule.affects_health,
                lower_threshold: lt,
                lower_notification: lnt,
                upper_notification: unt,
                upper_threshold: ut,
                lower_threshold_violation_percent: ROUND(100/snapshot_count * COUNT(violating_lower_threshold)),
                upper_threshold_violation_percent: ROUND(100/snapshot_count * COUNT(violating_upper_threshold)),   
                notification_lower_threshold_percent: ROUND(100/snapshot_count * COUNT(notification_lower_threshold)),
                notification_upper_threshold_percent: ROUND(100/snapshot_count * COUNT(notification_upper_threshold)),   
                recent_data: recent_data[*].value[aggregate_name] // used to calculate trend
            }}
        """
        result = self.__execute_query(aql, {
            'projects_and_indicators': projects_and_indicators,
            'tolerance': tolerance,
            'snapshot_indices': snapshot_indices
        })
        return result

    def delete_portfolio_indicator(self, health_indicator_id):
        return self.__delete_indicator(health_indicator_id, PORTFOLIO_HEALTH_INDICATOR_NAME)

    def delete_project_indicator(self, health_indicator_id):
        return self.__delete_indicator(health_indicator_id, REPOSITORY_HEALTH_INDICATOR_NAME)

    def __delete_indicator(self, health_indicator_id, edge_collection):
        """deletes the health indicator together with its metric rules and its relation to the portfolio/project.
                This is done by first collecting all adjacent edges into a single list and removing the edges all at once (the correct
                edge collection is only guessed by setting the ignore option). See here for details:
                https://www.arangodb.com/docs/stable/aql/examples-remove-vertex.html
                """
        aql = f"""
        FOR health_indicator IN HealthIndicator FILTER health_indicator._key == '{health_indicator_id}' 
        LET edges = (FOR v,e IN 1..1 ANY health_indicator GRAPH 'MetricAnalysis' RETURN e._key)
        LET r = (FOR key IN edges REMOVE key IN MetricRule  OPTIONS {{ ignoreErrors: true }} REMOVE key IN {edge_collection}  OPTIONS {{ ignoreErrors: true }}) 
        REMOVE health_indicator IN HealthIndicator
        """
        return self.__execute_query(aql)

    def __create_indicator(self, entity_id, health_indicator, entity_collection, indicator_edge_collection):
        graph = self.database.graphs[GRAPH_NAME]
        entity_document = self.database[entity_collection][entity_id]
        # create health indicator
        attributes = {'name': health_indicator['name']}
        # if the indicator does already exist, reset its id during creation
        if 'id' in health_indicator:
            attributes['_key'] = health_indicator['id']
        health_indicator_vertex = graph.createVertex(HEALTH_INDICATOR_NAME, attributes)
        graph.link(indicator_edge_collection, health_indicator_vertex._id, entity_document._id, {})
        # create metric rules
        for metric_rule in health_indicator['rules']:
            metric_document = self.database[METRIC_NAME][metric_rule['metricId']]
            metric_rule_edge = graph.link(METRIC_RULE_NAME, health_indicator_vertex._id, metric_document._id, {
                'lower_threshold': metric_rule['lowerThreshold'],
                'upper_threshold': metric_rule['upperThreshold'],
                'affects_health': metric_rule['affectsHealth'],
                'aggregate': metric_rule['aggregate']
            })
            metric_rule['id'] = metric_rule_edge._key
        health_indicator['id'] = health_indicator_vertex._key
        return health_indicator

    def create_portfolio_indicator(self, portfolio_id, health_indicator):
        return self.__create_indicator(portfolio_id, health_indicator, PORTFOLIO_NAME, PORTFOLIO_HEALTH_INDICATOR_NAME)

    def create_project_indicator(self, project_id, health_indicator):
        return self.__create_indicator(project_id, health_indicator, REPOSITORY_NAME, REPOSITORY_HEALTH_INDICATOR_NAME)

    def get_portfolios(self):
        aql = 'FOR p IN Portfolio RETURN p'
        return self.__execute_query(aql)

    def get_projects_by_portfolio(self, portfolio_key: str):
        aql = f"""
        FOR p in Portfolio
        FILTER p._key == '{portfolio_key}'
        FOR r IN 1..1 OUTBOUND p RepositoryInPortfolio 
        RETURN r
        """
        return self.__execute_query(aql)

    def get_project_health_indicators(self, portfolio_key: str):
        aql = f"""
        FOR entry in (
            FOR portfolio IN Portfolio
            FILTER portfolio._key == '{portfolio_key}'
            FOR repository IN 1..1 OUTBOUND portfolio RepositoryInPortfolio
            FOR health_indicator IN 1..1 INBOUND repository HealthIndicatorForRepository
                FOR metric, metric_rule IN 1..1 OUTBOUND health_indicator MetricRule
                RETURN {{
                    indicator: health_indicator,
                    repository_id: repository._key,
                    rules: {{
                        id: metric_rule._key,
                        metricId: metric._key,
                        lowerThreshold: metric_rule.lower_threshold,
                        upperThreshold: metric_rule.upper_threshold,
                        affectsHealth: metric_rule.affects_health,
                        'aggregate': metric_rule['aggregate']
                    }}
                }}
        )
        COLLECT indicator = entry.indicator, repository = entry.repository_id INTO by_indicator
        RETURN {{
            id: indicator._key,
            project: repository,
            name: indicator.name,
            rules: by_indicator[*].entry.rules
        }}
        """
        return self.__execute_query(aql)

    def get_portfolio_health_indicators(self, portfolio_key: str):
        aql = f"""
        FOR portfolio IN Portfolio FILTER portfolio._key == '{portfolio_key}'
        FOR health_indicator IN 1..1 INBOUND portfolio HealthIndicatorForPortfolio
        LET rules = (FOR metric, metric_rule IN 1..1 OUTBOUND health_indicator MetricRule RETURN {{
                    id: metric_rule._key,
                    metricId: metric._key,
                    lowerThreshold: metric_rule.lower_threshold,
                    upperThreshold: metric_rule.upper_threshold,
                    affectsHealth: metric_rule.affects_health,
                    'aggregate': metric_rule['aggregate']
        }})
        RETURN {{
                  id: health_indicator._key,
                  name: health_indicator.name,
                  rules: rules
        }}
        """
        return self.__execute_query(aql)

    def get_trends(self, project_id: str, metric_ids: List[str]):
        """returns the historical trend of the given metrics for the given project"""
        return self.get_metric_values_by_project(project_id, metric_ids)

    def get_relative_trends(self, project_id: str, metric_ids: List[str]):
        """Calculates the relative changes compared to a base line.
        Currently, the first element will be used as base line (maybe we can make it variable later?)
        and all other values are calculated as percentage of the base line
        """
        metric_string_list = map(lambda x: f'"{x}"', metric_ids)
        aql = f"""
                // first, calculate the absolute values for each index
                FOR entry IN (
                    FOR metric_key IN[{','.join(metric_string_list)}]
                        FOR repository in Repository FILTER repository._key == '{project_id}'
                        FOR snapshot IN 1..1 INBOUND repository._id SnapshotOfRepository
                        FOR metric, metric_value IN 1..1 OUTBOUND snapshot._id SnapshotSummary
                        FILTER metric._key == metric_key
                        SORT snapshot.index ASC
                        RETURN {{
                            metric: metric_key,
                            index_value: {{
                                index: snapshot.index,
                                date: snapshot.date,
                                id: snapshot._key,
                                // sum should be null for all metrics except LOC
                                sum: metric_value.sum_value,
                                average: metric_value.average_value,
                                median: metric_value.median_value,
                                min: metric_value.min_value,
                                max: metric_value.max_value
                            }}
                        }}
                )
                // now, group by metric and for every metric list,
                // calculate the relative values
                COLLECT metric = entry.metric INTO by_metric
                LET relative_values = (
                    FOR value in by_metric
                    RETURN {{
                        index: value.entry.index_value.index,
                        date: value.entry.index_value.date,
                        hash: value.entry.index_value.id,
                        id: value.entry.index_value.id,
                        // avoid division by zero if sum is not set
                        sum: by_metric[0].entry.index_value.sum != null ? (100 / by_metric[0].entry.index_value.sum * value.entry.index_value.sum) : 0,
                        average: 100 / by_metric[0].entry.index_value.average * value.entry.index_value.average,
                        median: 100 / by_metric[0].entry.index_value.median * value.entry.index_value.median,
                        // min/max does not make much sense for relative changes
                        min: null,
                        max: null
                    }}
                )
                RETURN {{
                    metric: metric,
                    index_values: relative_values[*]
                }}
                """
        return self.__execute_query(aql)

    def get_value_range(self, project_ids, metric_ids, use_total_values):
        """returns the min/max values for the given metrics over all projects.
        Used to set a uniform scaling factor for all diagrams within a trend visualization row
        If 'use_total_values' is set, not only the min/max aggregate values are considered, but also
        the total min, max values for any artifact that were recorded
        """
        metric_string_list = map(lambda x: f'"{x}"', metric_ids)
        project_string_list = map(lambda x: f'"{x}"', project_ids)
        aql = f"""
        LET query = (
            FOR r in Repository
            FILTER r._key IN [{','.join(project_string_list)}]
            FOR m IN Metric FILTER m._key IN [{','.join(metric_string_list)}]
            FOR s IN 1..1 INBOUND r SnapshotOfRepository
            FOR metric, e IN 1..1 OUTBOUND s SnapshotSummary
            FILTER metric == m
            RETURN {{
                median: e.median_value,
                average: e.average_value,
                sum: e.sum_value,
                total_min: e.min_value,
                total_max: e.max_value
            }}
        )
        LET median_min = [MIN(query[*].median)]
        LET median_max = [MAX(query[*].median)]
        LET average_min = [MIN(query[*].average)]
        LET average_max = [MAX(query[*].average)]
        LET sum_min = [MIN(query[*].sum)]
        LET sum_max = [MAX(query[*].sum)]
        LET total_min = [MIN(query[*].total_min)]
        LET total_max = [MAX(query[*].total_max)]
        RETURN {{
            median: {{
                min: @isAbsolute ? MIN(APPEND(total_min, median_min)) : MIN(median_min),
                max: @isAbsolute ? MAX(APPEND(total_max, median_max)) : MAX(median_max)
            }},
            average: {{
                min: @isAbsolute ? MIN(APPEND(total_min, average_min)) : MIN(average_min),
                max: @isAbsolute ? MAX(APPEND(total_max, average_max)) : MAX(average_max)
            }},
            sum: {{
                min: @isAbsolute ? MIN(APPEND(total_min, sum_min)) : MIN(sum_min),
                max: @isAbsolute ? MAX(APPEND(total_max, sum_max)) : MAX(sum_max)
            }}
        }}
        """
        return self.__execute_query(aql, {'isAbsolute': use_total_values})

    def get_metric_values_by_project(self, project_key, metric_keys):
        """collects all metric values for a given repository and the give metric ids.
        The data are grouped by metric key and sorted by snapshot index.
        Obsolete: Should be merged into get_trends"""
        metric_string_list = map(lambda x: f'"{x}"', metric_keys)
        aql = f"""
        FOR entry IN (
            FOR metric_key IN[{','.join(metric_string_list)}]
                FOR repository in Repository FILTER repository._key == '{project_key}'
                FOR snapshot IN 1..1 INBOUND repository._id SnapshotOfRepository
                FOR metric, metric_value IN 1..1 OUTBOUND snapshot._id SnapshotSummary
                FILTER metric._key == metric_key
                SORT snapshot.index ASC
                RETURN {{
                    metric: metric_key,
                    index_value: {{
                        index: snapshot.index,
                        date: snapshot.date,
                        hash: snapshot._key,
                        // sum should be null for all metrics except LOC
                        sum: metric_value.sum_value,
                        average: metric_value.average_value,
                        median: metric_value.median_value,
                        min: metric_value.min_value,
                        max: metric_value.max_value
                    }}
                }}
        )
        COLLECT metric = entry.metric INTO by_metric
        RETURN {{
            metric: metric,
            index_values: by_metric[*].entry.index_value
        }}
        """
        return self.__execute_query(aql)

    def get_metrics(self):
        """returns a list of all available metrics in the database"""
        aql = "FOR m IN Metric RETURN m"
        return self.__execute_query(aql)

    def get_snapshots_for_project(self, project_key):
        aql = f"""
        FOR repository in Repository FILTER repository._key == '{project_key}'
            FOR snapshot IN 1..1 INBOUND repository SnapshotOfRepository
        RETURN {{
            hash: snapshot._key,
            progress: snapshot.project_progress_percentage,
            index: snapshot.index,
            date: snapshot.date,
            message: snapshot.message
        }}
        """
        return self.__execute_query(aql)
