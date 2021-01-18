from model import RepositoryBase
from github import Github
import os
import git
from pydriller import GitRepository
from configuration import REPOSITORY
from model import RepositorySnapshot
from .progress import GitCloneProgress
from typing import List
import itertools
import math


class GithubRepository(RepositoryBase):
    """Implementation of the Repository protocol that connects to Github and operates on a git repository
    """

    def __init__(self, repository_id: str, index: int):
        super().__init__(repository_id, index)
        self.full_name = repository_id
        # reference to PyDriller Repository, will be set after the repository was cloned successfully
        self.__internal_repository = None

    def checkout(self, download_folder: str) -> 'Repository':
        github_interface = Github(REPOSITORY.GITHUB_TOKEN)
        try:
            # get repository data from github
            repository = github_interface.get_repo(self.full_name)
            self.name = repository.name
            self.description = repository.description
            self.key = str(repository.id)
            self.language = repository.language
            self.home_page = repository.homepage
            self.html_url = repository.html_url
            clone_url = repository.clone_url
            # check if there is already a directory for the repository
            self.path = os.path.join(download_folder, self.name)

            if os.path.exists(self.path):
                print(f'{self.name} already downloaded, skipping...')
            else:
                os.makedirs(self.path)
                # download repository into folder
                progress = GitCloneProgress(self.name, self.index)
                git.Repo.clone_from(clone_url, self.path, progress=progress)
        except Exception as e:
            print(f'error while reading repository "{self.full_name}": {str(e)}')
        return self

    def get_snapshots(self, sample_count: int) -> List[RepositorySnapshot]:
        """
        returns all snapshots for the given repository. The sample_count defines
        how many commits should be retrieved. If the repository has more commits than
        the total sample count, commits will be taken so that their commit number is
        evenly distributed. For every commit, a percentage is calculated expressing the time
        of this commit within the total project runtime.
        If the repository has less commits, all commits will be returned.
        :param sample_count:
        :return: list of snapshots
        """
        # ensure that we are always on main branch before receiving commits
        if self.__internal_repository is None:
            self.__internal_repository = GitRepository(self.path)
            self.__internal_repository.reset()
        # calculate sample rate
        commit_count = self.__internal_repository.total_commits()
        if commit_count < sample_count:
            sample_rate = 1
        else:
            sample_rate = math.floor(commit_count / sample_count)
        # get first and last commit to calculate the complete project duration
        first = next(self.__internal_repository.get_list_commits(None, reverse=True))
        last = next(self.__internal_repository.get_list_commits(None, reverse=False))
        time_range = last.committer_date - first.committer_date
        # ensure that newest item is always in list, so do not reverse order during slicing
        # so the newest one will be the first item, the oldest sample the last
        commits = self.__internal_repository.get_list_commits(None, reverse=False)
        snapshots = [RepositorySnapshot(
            commit.hash,
            commit.committer_date,
            commit.msg,
            (commit.committer_date - first.committer_date) * 100 / time_range,
            sample_count - index)  # index is reversed, so subtract it from total amount to get revered order
            for index, commit in enumerate(list(itertools.islice(commits, 0, None, sample_rate)))][:sample_count]
        # snapshots are in reverse order, so newest will be analyzed first
        return snapshots

    def reset(self):
        self.__internal_repository.reset()

    def update(self, snapshot: RepositorySnapshot):
        self.__internal_repository.checkout(snapshot.key)
        return self


def factory(repository_id: str, index: int) -> RepositoryBase:
    return GithubRepository(repository_id, index)