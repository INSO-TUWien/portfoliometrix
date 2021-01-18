class Portfolio:
    """stores information about a single portfolio
    of a company
    """
    def __init__(self, name, description, repositories):
        self.name = name
        self.description = description
        self.repositories = repositories
