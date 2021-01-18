import os
from storage import DataStore
from configuration import METRICS, PORTFOLIOS, REPOSITORY
from downloading import RepositoryDownloader, factory
from analysis import UnderstandMetricCollector, RepositoryAnalysis
from profile import Profiler
from processing import PostProcessor

if __name__ == '__main__':

    # setup database
    data_store = DataStore()
    data_store.store_metrics(METRICS.ITEMS)
    post_processor = PostProcessor(data_store)

    # print('calculate distributions...')
    # post_processor.distribute_metrics()
    # print('done')

    # store metric keys for later use
    metric_keys = [metric.key for metric in METRICS.ITEMS]
    # process portfolios one by one
    for portfolio in PORTFOLIOS.ITEMS:
        print(f'processing portfolio {portfolio.name}...')
        data_store.store_portfolio(portfolio)
        repositories = portfolio.repositories
        # clone repositories into local folders
        print('download repositories')
        repository_downloader = RepositoryDownloader(REPOSITORY.DOWNLOAD_FOLDER)
        repositories = repository_downloader.get_repositories(repositories, factory)
        # collect metrics
        analysis_folder = './repository-analysis'
        if not os.path.exists(analysis_folder):
            os.makedirs(analysis_folder)
        # setup time logging
        profiler = Profiler(os.path.join(analysis_folder, f'{portfolio.name}-profiling.csv'))
        # start analysis phase
        for repository in repositories:
            print('save repositories in database')
            data_store.store_repository(repository, portfolio.name)
            try:
                print(f'processing repository {repository.name}')
                metric_collector = UnderstandMetricCollector(repository.name, repository.language, analysis_folder, metric_keys, repository.path)
                snapshots = repository.get_snapshots(REPOSITORY.TOTAL_SNAPSHOT_SAMPLE_COUNT)
                snapshot_count = len(snapshots)
                print(f'number of snapshots in repository: {snapshot_count}')
                repository_analysis = RepositoryAnalysis(repository.key)
                for index, snapshot in enumerate(snapshots, start=0):
                    print(f'processing commit {snapshot.key}')
                    # checkout commit
                    print('\tchecking out...')
                    with(profiler.start(Profiler.CHECKOUT)):
                        repository.update(snapshot)
                    # analyze commit
                    print(f'\tanalyzing snapshot {index + 1} of {snapshot_count}')
                    with(profiler.start(Profiler.ANALYSIS)):
                        snapshot_result = metric_collector.collect_metrics(snapshot)
                    if not snapshot_result:
                        print('\tno result calculated, skipping...')
                    else:
                        # store analysis data
                        repository_analysis.add_snapshot_result(snapshot_result)
                    profiler.save(repository.name, snapshot.key)
                print('\twriting analysis to database...')
                with(profiler.start(Profiler.STORAGE)):
                    data_store.store_analysis_result(repository_analysis)
                profiler.save_storage(repository.name)
                # do data post processing (aggregating, etc...)
                print(f'\tdoing post processing for {repository.name}...')
                for metric_key in metric_keys:
                    post_processor.aggregate_metrics(repository.key, metric_key)
            finally:
                # set repo back to main branch after finishing
                repository.reset()
    print('calculate distributions...')
    post_processor.distribute_metrics()
    print('done')