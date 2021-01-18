from model.snapshot import RepositorySnapshot
from typing import List
import abc


class RepositoryBase(abc.ABC):

    def __init__(self, repository_id: str, index: int):
        self.full_name = ''
        self.repository_id = repository_id
        self.key = 'not set'
        self.name = 'not set'
        self.description = 'no description yet'
        self.path = 'not set'
        # because of simultaneous downloads, we store the index for console print positioning
        self.index = index
        # the programming language of the repository
        self.language = ''
        self.home_page = ''
        self.html_url = ''

    @abc.abstractmethod
    def checkout(self, download_folder: str) -> 'RepositoryBase':
        """
        should download the repository from its remote location ('clone' operation in git)
        :param download_folder: root-folder where the repository should be stored
        :return: this repository
        """
        pass

    @abc.abstractmethod
    def update(self, snapshot: RepositorySnapshot) -> 'RepositoryBase':
        """
        updates the local repository to the given snapshot (in git, this is a 'checkout' operation.
        :param snapshot: The snapshot (commit) to which the repository should be updated.
        :return:
        """
        pass

    @abc.abstractmethod
    def get_snapshots(self, sample_count: int) -> List[RepositorySnapshot]:
        """
        generates the newest smaple_count snapshot objects of this repository.
        :return: the newest sample_count snapshots of this repository
        """
        pass

    @abc.abstractmethod
    def reset(self) -> 'RepositoryBase':
        """
        should reset the repository to its inital snapshot/commit, reverting all previous update methods.
        :return:
        """
        pass



