from flask_restful import Resource
from flask import jsonify
from injector import inject
from backend_application.service import ProjectService

"""
Portfolio related resources.
Resources will be called when an API route is requested.
Relevant services will be injected during object initialization.
"""


class PortfolioList(Resource):

    @inject
    def __init__(self, project_service: ProjectService):
        self.project_service = project_service

    """
    returns a list of available portfolios
    """
    def get(self):
        portfolios = self.project_service.get_portfolios()
        # keep in mind that we use the arangodb 'key' as the 'id',
        # since the key is enough to identify a document within a collection
        result = jsonify([{'id': p['_key'], 'name': p['_key'], 'description': p['description']} for p in portfolios])
        return result

