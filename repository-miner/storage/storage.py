from pyArango.theExceptions import DocumentNotFoundError
import math

import analysis.entity
from configuration import ARANGODB
from pyArango.connection import *
import analysis
from .graph import MetricAnalysis, Metric, Repository, Snapshot, Entity, \
        MetricValue, SnapshotOfRepository, EntityInRepository, Portfolio, \
        RepositoryInPortfolio, Distribution
from model import RepositoryBase, Portfolio, RepositorySnapshot
from typing import List


def chunks(lst, n):
    """converts a list into chunks of length n, implementation taken from
    https://stackoverflow.com/questions/312443/how-do-you-split-a-list-into-evenly-sized-chunks"""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


class DataStore:
    """ handles interaction with the ArangoDB """

    def __init__(self):
        self.graph = None
        """ setup initial database connection
        Uses ArangoDB connection information from the configuration file
        """
        connection = Connection(arangoURL=ARANGODB.URL, username=ARANGODB.USER,
                                password=ARANGODB.PASSWORD)
        if not connection.hasDatabase(ARANGODB.DB_NAME):
            connection.createDatabase(name=ARANGODB.DB_NAME)
        self.database = connection[ARANGODB.DB_NAME]
        self.database.reloadCollections()
        # setup the graph structure
        if not self.database.hasGraph(MetricAnalysis.__name__):
            self.graph = self.database.createGraph(name=MetricAnalysis.__name__)
        else:
            self.graph = self.database.graphs[MetricAnalysis.__name__]
            # recreate graph every time if flag is set
            if ARANGODB.RECREATE_GRAPH:
                self.database.dropAllCollections()
                self.graph = self.database.createGraph(name=MetricAnalysis.__name__)

    def store_metrics(self, metric_definitions):
        """
        stores the given metrics into the database if they do not exist already
        """
        for metric_definition in metric_definitions:
            try:
                self.database[Metric.__name__][metric_definition.key]
            except DocumentNotFoundError:
                self.graph.createVertex(Metric.__name__, {
                    "name": metric_definition.name,
                    "description": metric_definition.description,
                    "_key": metric_definition.key
                })

    def store_portfolio(self, portfolio: Portfolio):
        """stores the given portfolio and the connection between the portfolio
        and the metric"""
        try:
            self.database[Portfolio.__name__][portfolio.name]
        except DocumentNotFoundError:
            self.graph.createVertex(Portfolio.__name__, {
                "_key": portfolio.name,
                "description": portfolio.description
            })
            
    def store_repository(self, repository: RepositoryBase, portfolio_name):
        """
        stores the given repositories in the database if they do not exist already
        """
        try:
            repository_vertex = self.database[Repository.__name__][repository.key]
        except DocumentNotFoundError:
            repository_vertex = self.graph.createVertex(Repository.__name__, {
                "_key": repository.key,
                "name": repository.name,
                "description": repository.description,
                "full_name": repository.full_name,
                "language": repository.language,
                "home_page": repository.home_page,
                "html_url": repository.html_url
            })
            # connect repository with portfolio
            # (this means every repository can only be connected to one portfolio, is this enough or
            # can we have one repository in more than one portfolio?)
            portfolio = self.database[Portfolio.__name__][portfolio_name]
            self.graph.link(RepositoryInPortfolio.__name__, portfolio._id, repository_vertex._id, {})

    def store_snapshots(self, snapshots: List[RepositorySnapshot], repository_key: str):
        snapshots_to_add = []
        snapshots_in_repository = []
        for snapshot in snapshots:
            snapshots_to_add.append({
                '_key': snapshot.key,
                'date': snapshot.date,
                'message': snapshot.message,
                'project_progress_percentage': snapshot.project_progress_percentage,
                'index': snapshot.index
            })
            snapshots_in_repository.append({
                '_from': f'{Snapshot.__name__}/{snapshot.key}',
                '_to': f'{Repository.__name__}/{repository_key}'
            })
        snapshot_collection = self.database[Snapshot.__name__]
        snapshot_collection.bulkSave(snapshots_to_add, onDuplicate='ignore')
        snapshot_to_repository_collection = self.database[SnapshotOfRepository.__name__]
        snapshot_to_repository_collection.bulkSave(snapshots_in_repository)

    def store_entities(self, entities: List[analysis.entity.Entity], repository_key: str):
        entities_to_add = []
        entities_to_repository = []
        for entity in entities:
            entities_to_add.append({
                '_key': entity.id,
                'name': entity.entity_name,
                'kind': entity.kind,
                'file': entity.file
            })
            entities_to_repository.append({
                '_from': f'{Entity.__name__}/{entity.id}',
                '_to': f'{Repository.__name__}/{repository_key}'
            })
        # store entities and edges in one batch
        # as there can be a large number of entities (> 100 000), it seems to work
        # better to separate the whole list into smaller chunks and process them sequentially
        # an optimal chunk size has yet to be determined
        entity_collection = self.database[Entity.__name__]
        DataStore.__bulk_save_chunks(entity_collection, entities_to_add)
        entity_to_repository_collection = self.database[EntityInRepository.__name__]
        DataStore.__bulk_save_chunks(entity_to_repository_collection, entities_to_repository)

    @staticmethod
    def __bulk_save_chunks(collection, data_list):
        """
        saves the given data list into the given collection via a bulk operation.
        The data_list is separated in a lists of <chunk_size> elements
        :param collection:
        :param data_list:
        :return:
        """
        # chunk_size = 2000
        # data_count = len(data_list)
        # chunk_count = math.ceil(data_count / chunk_size)
        name = type(collection).__name__
        print(f'\tsaving {len(data_list)} items in {name}...')
        save_result = collection.bulkSave(data_list, onDuplicate='ignore')
        print(f'\t{save_result} items saved.')

        # for index, data in enumerate(chunks(data_list, chunk_size)):
        #    print(f'\twriting {name} {index + 1} of {chunk_count}', end='\r', flush=True)
        #    save_result = collection.bulkSave(data, onDuplicate='ignore')
        #    print(save_result)
        # print new line
        # print('', end='\n')

    def store_analysis_result(self, repository_analysis: analysis.RepositoryAnalysis):

        repository_key = repository_analysis.repository_key
        entities = repository_analysis.get_all_entities()
        snapshots = repository_analysis.get_all_snapshots()
        self.store_entities(entities, repository_key)
        self.store_snapshots(snapshots, repository_key)

        # create a list of dictionaries and save them in bulk operation
        metrics_dict = []
        for result in repository_analysis.results:
            for metrics_per_entity in result.metrics_per_entity:
                for key, value in metrics_per_entity.metric_values.items():
                    metrics_dict.append({
                        'metric': key,
                        'value': value,
                        '_from': f'{Entity.__name__}/{metrics_per_entity.entity.id}',
                        '_to': f'{Snapshot.__name__}/{result.snapshot.key}'
                    })
        metric_value_edge_collection = self.database[MetricValue.__name__]
        DataStore.__bulk_save_chunks(metric_value_edge_collection, metrics_dict)

    def execute_script(self, script_content: str):
        """executes the given aql string"""
        query_result = self.database.AQLQuery(script_content, rawResults=True, batchSize=100)
        # for result in query_result:
        #     print(result)
        return query_result
    
    def store_distributions(self, distributions):
        distribution_collection = self.database[Distribution.__name__]
        distribution_collection.truncate()
        distribution_collection.bulkSave(distributions, onDuplicate='ignore')
        


