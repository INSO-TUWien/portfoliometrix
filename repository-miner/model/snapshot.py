from datetime import datetime


class RepositorySnapshot:
    """
    a snapshot represents the repository at a specific commit
    """
    def __init__(self,
                 snapshot_id: str,
                 snapshot_date: datetime,
                 snapshot_message: str,
                 project_progress_percentage,
                 index):
        """
        initializes the snapshot
        :param snapshot_id: the commit hash which identifies this snapshot
        :param snapshot_date: date at which the commit was created
        """
        self.key = snapshot_id
        self.date = snapshot_date
        self.message = snapshot_message
        # percentage of commit time in regard of the overall project time.
        self.project_progress_percentage = project_progress_percentage
        # increasing index used to group commits of different repositories later
        self.index = index

