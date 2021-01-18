from flask_restful import Resource
from flask import jsonify
from injector import inject
from backend_application.service import ProjectService


class ProjectList(Resource):

    @inject
    def __init__(self, project_service: ProjectService):
        self.project_service = project_service

    """ returns list of projects with their id name, and description"""
    def get(self, portfolio_key: str):
        projects = self.project_service.get_projects_by_portfolio(portfolio_key)
        result = jsonify([{
            'id': p['_key'],
            'name': p['name'],
            'description': p['description'],
            'language': p['language'],
            'homePage': p['home_page'],
            'htmlUrl': p['html_url']
        } for p in projects])
        return result
