from jinja2 import Environment, PackageLoader, TemplateNotFound
from storage import DataStore
import numpy

env = Environment(loader=PackageLoader('processing', 'aql_templates'))


class PostProcessor:
    """can execute scripts on a repository to post process the collected metric data"""
    def __init__(self, data_store: DataStore):
        self.data_store = data_store

    def aggregate_metrics(self, repository_key, metric_key):
        """tries to find the given script and executes it on the data store.
        If the script is not found, a default script will be executed.
        """
        try:
            template = env.select_template([f'aggregate_{metric_key}.aql', 'aggregate_default.aql'])
            content = template.render(repository_key=repository_key, metric_key=metric_key)
            self.data_store.execute_script(content);
        except TemplateNotFound:
            print(f'could not find any AQL template for {metric_key}, could not aggregate metrics')

    # custom definitions of bin widths depending on the metric
    bin_definitions = {
        'MaxInheritanceTree': {
            'default': list(range(1, 6))
        },
        'CountClassCoupled': {
            'default': list(range(0, 20, 2))
        },
        'MaxCyclomatic': {
            'default': list(range(0, 10, 1))
        },
        'PercentLackOfCohesion': {
            'default': list(range(0,100,10))
        },
        'RatioCommentToCode': {
            'default': list(numpy.arange(0.0, 1.0, 0.1))
        }
    }

    def distribute_metrics(self):
        try:
            template = env.select_template(['distribute_default.aql'])
            content = template.render()
            # execute script to retrieve grouped metric values
            result = self.data_store.execute_script(content)
            # calculate histograms
            for snapshot in result:
                for metric in snapshot['metrics']:
                    for project in metric['projects']:
                        values = project['values']
                        if metric['id'] in self.bin_definitions:
                            bin_definition_for_metric = self.bin_definitions[metric['id']]
                            if project['kind'] in bin_definition_for_metric:
                                bin_definition_for_kind = bin_definition_for_metric[project['kind']]
                            else:
                                bin_definition_for_kind = bin_definition_for_metric['default']
                            bin_definition = bin_definition_for_kind + [max(max(values), max(bin_definition_for_kind))]
                        else:
                            bin_definition = 10
                        (histogram, bins) = numpy.histogram(values, bin_definition)
                        # create list of bins showing 'start - end'
                        bin_labels = []
                        for index, bin in enumerate(bins):
                            if index == 0:
                                continue
                            lower_value = bins[index - 1]
                            upper_value = bins[index]
                            # format values to one decimal
                            if isinstance(lower_value, float):
                                lower_value = f'{lower_value:.1f}'
                            if isinstance(upper_value, float):
                                upper_value = f'{upper_value:.1f}'
                            # in case the bin has a range of one, show only the one number
                            if lower_value == upper_value:
                                label = f'{lower_value}'
                            else: # use including brackets for last entry, otherwise excluding
                                if index == len(bins) - 1:
                                    label = f'[{lower_value} - {upper_value}]'
                                else:
                                    label = f'[{lower_value} - {upper_value})'
                            # upper = f'{bins[index]:.0f}' if bins[index] else f'{bins[index]:.2f}'
                            # lower = f'{bins[index - 1]:.0f}' if bins[index - 1] else f'{bins[index - 1]:.2f}'
                            # upper = f'{bins[index]:.0f}' if bins[index] else f'{bins[index]:.2f}'
                            bin_labels.append(label)
                            # bin_labels.append(f'{lower} - {upper}')
                            project['values'] = [{
                                'name': bin,
                                'value': int(distribution)
                            } for bin, distribution in zip(bin_labels, histogram)]
            # store histogram data in DB
            self.data_store.store_distributions(result)
        except TemplateNotFound:
            print(f'could not find template for calculating distributions')
