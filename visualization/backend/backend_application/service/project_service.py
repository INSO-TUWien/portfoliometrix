from injector import inject
from backend_application.repository import DatabaseRepository


class ProjectService:

    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    """
    returns project relevant data, like application
    domains, projects per application domain etc...
    """
    def get_portfolios(self):
        return self.repository.get_portfolios()

    def get_projects_by_portfolio(self, portfolio_key: str):
        return self.repository.get_projects_by_portfolio(portfolio_key)

