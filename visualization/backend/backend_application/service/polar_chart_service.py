from injector import inject
from backend_application.repository import DatabaseRepository
from typing import List
import numpy


class PolarChartService:
    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    def get_polar_chart_data(self, project_keys: List[str], metric_ids: List[str]):

        # TODO: currently, we are normalizing only within the same project, but should we normalize
        # over all projects instead?
        # Normalizing over all projects has the advantage that two polar charts can directly be compared with each other
        # Normalizing within the project simplifies recognition of patterns, for example:
        #   whenever SLOC reaches half of the whole project SLOC, complexity increases also over half etc...
        #   this would not be possible to recognize if scaling would go over both projects

        # collect min, max values for normalizing
        min_max_dic = {}
        min_max = self.repository.get_range_by_project_and_snapshot(project_keys, metric_ids)
        # convert the range list to dictionary for easier access
        for min_max_entry in min_max:
            project = min_max_entry['project']
            metric = min_max_entry['metric']
            if project not in min_max_dic:
                min_max_dic[project] = {}
            # since combination project -> metric is unique, there will never be a metric entry before
            min_max_dic[project][metric] = {
                'sum': min_max_entry['sum'],
                'median': min_max_entry['median']
            }
        # request values grouped by snapshot and project
        values = self.repository.get_metric_values_by_project_and_snapshot(project_keys, metric_ids)
        # iterate over the values and normalize them
        for snapshot_entry in values:
            for project_entry in snapshot_entry['data']:
                project = project_entry['project']
                for metric_value in project_entry['series']:
                    # always try sum first, if not available, use median
                    dic_entry = min_max_dic[project][metric_value['metric_id']]
                    aggregate_name = 'sum'
                    min_max_value = dic_entry[aggregate_name]
                    if min_max_value['min'] is None:
                        aggregate_name = 'median'
                        min_max_value = dic_entry[aggregate_name]
                    # calculate normalized value
                    if min_max_value['max_minus_min'] == 0:
                        normalized_value = 0
                    else:
                        normalized_value = (metric_value[f'{aggregate_name}_value'] - min_max_value['min']) / min_max_value['max_minus_min']
                    metric_value['normalized_value'] = normalized_value
                    metric_value['real_value'] = metric_value[f'{aggregate_name}_value']
        return values



