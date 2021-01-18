from analysis.analysis_result import AnalysisResult
from analysis.metric_collector import MetricCollectorBase
from analysis.metrics_for_entity import EntityMetricValues
from model import RepositorySnapshot
import os
import subprocess
import csv
from typing import List
import shutil

"""types of entities that should be analyzed"""
VALID_ENTITIES = ('file', 'method', 'class')


class UnderstandMetricCollector(MetricCollectorBase):
    """
    Metric collector implementation that uses SciTools Understand metric command line interface
    """
    def __init__(self, repository_name: str, repository_language: str, analysis_folder: str, metric_ids: List[str], source_path: str):
        super().__init__(repository_name, repository_language, analysis_folder, metric_ids, source_path)
        # create the DB initially
        metrics = ' '.join(self.metric_ids)
        db_file = os.path.join(self.root_path, repository_name)
        batch_commands = f"""
            create -languages {self.language} {db_file}
            add -exclude "*test*.*","*Test*.*" {source_path}
            settings -metrics {metrics}
            settings -MetricsFileNameDisplayMode FullPath
            settings -MetricsShowDeclaredInFile on
            settings -MetricsDeclaredInFileDisplayMode FullPath
        """
        command_file_name = os.path.join(self.root_path, 'setup_db.txt')
        with open(command_file_name, 'w+') as command_file:
            command_file.write(batch_commands)
        subprocess.check_output(['und', command_file_name]).decode("utf-8")

    def collect_metrics(self, snapshot: RepositorySnapshot) -> AnalysisResult:
        """ creates an Understand cmd file and executes the Understand command line
        to calculate the metrics.
        :param source_path: path where the source code of the repository is located
        :param snapshot: The current snapshot of the repository that should be analyzed.
        :return: The analysis result containing a list of entities and their metrics
        """
        snapshot_result_path = os.path.join(self.root_path, snapshot.key)
        if not os.path.exists(snapshot_result_path):
            os.makedirs(snapshot_result_path)

        # Understand requires a database file to store metrics
        db_file = os.path.join(self.root_path, self.repository_name)

        # use UND batch mode
        # The group of the settings must be prefixed, therefore "Metrics"...
        # There seems to be a bug in the RelativePath mode, as sometimes
        # the relative root directory (e.g. 'source') is missing from the path
        # (it's not in the output result file, but in the DB (?) )
        # so instead the absolute path is used and truncated later
        batch_commands = f"""
                    analyze -rescan -changed {db_file}
                    metrics
                """
        # write commands to batch
        command_file_name = os.path.join(snapshot_result_path, 'analyze.txt')
        with open(command_file_name, 'w+') as command_file:
            command_file.write(batch_commands)
        # execute commands in batch process
        # seems like that the understand processes crashes non-deterministically,
        # so we have to try it several times
        max_tries = 3
        result = None
        for i in range(max_tries):
            result = self.__internal_collect_metrics(command_file_name, snapshot_result_path, snapshot)
            if not result:
                print(f'\tError while executing understand for snapshot {snapshot.key}, try {i+1} of {max_tries}')
            else:
                break
        return result

    def __internal_collect_metrics(self, command_file_name: str, result_path: str, snapshot: RepositorySnapshot):
        """the metrics collection procedure is extracted into a separate method,
        so that we can execute it several times in case the understand process crashes
        """
        try:
            command_log = subprocess.check_output(['und', command_file_name]).decode("utf-8")
            command_lines = command_log.splitlines()
            log_file_name = os.path.join(result_path, 'log.txt')
            with open(log_file_name, 'w+') as log_file:
                log_file.writelines(command_lines)
            # the last line contains the analysis result, so print it
            print(f'\t{command_lines[-1]}')
            # the batch command should have created a result csv file
            # with the metrics in the root folder => copy result to snapshot folder
            result_file_in_root = os.path.join(self.root_path, f'{self.repository_name}.csv')
            result_file_in_snapshot = os.path.join(result_path, f'{self.repository_name}.csv')
            shutil.move(result_file_in_root, result_file_in_snapshot)
            # copy to snapshot folder
            analysis_result = self.__collect_result(result_file_in_snapshot, snapshot, self.source_path)
            return analysis_result
        except subprocess.CalledProcessError:
            return None

    @staticmethod
    def __map_entity_type(found_entity_type: str) -> str:
        """
        this method simplifes the entity type to one of the following
        types: file, method or class
        :param found_entity_type: the entity type provided by understand
        :return: one of the entity types (method, class)
        """
        lower_kind = found_entity_type.lower()
        if 'unknown' in lower_kind:
            return 'unknown'
        if 'file' in lower_kind:
            return 'file'
        if 'method' in lower_kind:
            return 'method'
        if 'class' in lower_kind:
            return 'class'
        # these are simplifications of the possible types
        if 'constructor' in lower_kind:
            return 'method'
        if 'interface' in lower_kind:
            return 'class'
        if 'struct' in lower_kind:
            return 'class'
        return 'unknown' # if no class, method or file, we don't handle it

    @staticmethod
    def __collect_result(result_file: str, snapshot: RepositorySnapshot, source_path: str) -> AnalysisResult:
        """
        collects the result data from the analysis output file
        and stores it in a result object
        :param result_file: path to the result file containing the metric values
        :param snapshot: the snapshot for which the results were calculated
        :return: a result object containing all metric values organized by entities
        """
        result = AnalysisResult(snapshot)
        if os.path.exists(result_file):
            # read data as csv file
            with open(result_file, 'r') as csv_file:
                csv_reader = csv.reader(csv_file, delimiter=',')
                metric_keys = []
                for row_index, row in enumerate(csv_reader, start=0):
                    if row_index == 0:
                        # first column is entity type, second is name and the rest are metric ids
                        metric_keys = row[3:]
                    else:
                        kind = UnderstandMetricCollector.__map_entity_type(str(row[0]))
                        # skip entities that could not be recognized
                        if kind is 'unknown':
                            continue
                        name = row[1]
                        file = row[2]
                        metrics = row[3:]
                        # collect metric values
                        # if kind == 'file':
                        # subtract source path from file
                        absolute_source_path = os.path.abspath(source_path)
                        file = file.replace(absolute_source_path, '')
                        if file.startswith('/') or file.startswith('\\'):
                            file = file[1:]
                        # file entity uses file name as file location
                        if kind is 'file':
                            name = file
                        metrics_for_entity = EntityMetricValues(name, kind, file)
                        for metric_index, metric_key in enumerate(metric_keys, start=0):
                            metric_value = metrics[metric_index]
                            if metric_value == '' or \
                               metric_value == '0' or \
                               metric_value == '0.00':
                                # metric is not supported for this entity -> skip it
                                continue
                            metrics_for_entity.add_metric_value(metric_key, float(metric_value))
                        # store entity and its metric values in result list
                        result.add_entity_metrics(metrics_for_entity)
        return result
