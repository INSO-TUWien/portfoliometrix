# contains all repository relevant configuration data
class REPOSITORY:
    """general repository data"""
    DOWNLOAD_FOLDER = '../repositories'
    CLEAR_DOWNLOAD_FOLDER = True
    GITHUB_TOKEN = '' # provide your Github access token here
    # total amount of commits that should be analyzed per repository.
    # If the repository has more commits, a sample rate will be calculated
    # and only relevant commits will be analyzed (downsampling)
    TOTAL_SNAPSHOT_SAMPLE_COUNT = 50
