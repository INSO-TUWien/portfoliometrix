import os
import stat
import shutil
import sys
import multiprocessing
from model import RepositoryBase
from typing import List

from configuration import REPOSITORY


class RepositoryDownloader:

    def __init__(self, download_folder: str):
        self.download_folder = download_folder

    def checkout_repositories(self, repository_data) -> RepositoryBase:
        """
        creates a new repository by checking out its source coded and storing
        it in a local directory
        :param repository_data: a tuple containing initialization data for the repository
        :return: the repository instance
        """
        (rid, index, factory) = repository_data
        repository = factory(rid, index)
        repository.checkout(self.download_folder)
        return repository

    def get_repositories(self, repository_ids: List[str], repository_factory) -> List[RepositoryBase]:
        if REPOSITORY.CLEAR_DOWNLOAD_FOLDER and os.path.exists(self.download_folder):
            print('removing existing repositories...')
            shutil.rmtree(self.download_folder, onerror=self.on_delete_error)
        if not os.path.exists(self.download_folder):
            os.makedirs(self.download_folder)
        print('starting downloads...')
        repositories = []
        repository_data = [(repository_id, index, repository_factory) for
                           (index, repository_id) in enumerate(repository_ids, start=0)]
        # create repository objects from given ids
        with multiprocessing.Pool() as pool:
            result = pool.map(self.checkout_repositories, repository_data)
            repositories = repositories + result
            sys.stdout.write('\n' * len(repository_ids))
        print('download completed.')
        return repositories

    @staticmethod
    def on_delete_error(func, path, exc_info):
        """
        Implementation taken from:
        https://stackoverflow.com/questions/2656322/shutil-rmtree-fails-on-windows-with-access-is-denied
        Error handler for ``shutil.rmtree``.
        If the error is due to an access error (read only file)
        it attempts to add write permission and then retries.
        If the error is for another reason it re-raises the error.
        """
        if not os.access(path, os.W_OK):
            # Is the error an access error ?
            os.chmod(path, stat.S_IWUSR)
            func(path)
        else:
            raise
