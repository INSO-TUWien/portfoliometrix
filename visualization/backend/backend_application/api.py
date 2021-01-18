from flask import Flask
from flask_restful import Api
from backend_application.resource import ProjectList, PortfolioList, Metric, \
    Snapshot, Trend, Range, HealthIndicator, Health, \
    PortfolioHealthState, ProjectHealthState, Distribution, Artifact, PolarChart, SnapshotHealthState
from flask_cors import CORS
from webargs.flaskparser import parser, abort

app = Flask(__name__)
api = Api(app, prefix='/api')
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

api.add_resource(Health,'/health')
api.add_resource(PortfolioList, '/portfolios')
api.add_resource(ProjectList, '/projects/<portfolio_key>')
api.add_resource(Metric, '/metrics')
api.add_resource(Trend, '/trends')
api.add_resource(Range, '/range')
api.add_resource(HealthIndicator, '/health-indicators')
api.add_resource(PortfolioHealthState, '/portfolio-health-state')
api.add_resource(ProjectHealthState, '/project-health-state')
api.add_resource(SnapshotHealthState, '/snapshot-health-state')
api.add_resource(Snapshot, '/snapshots/<project_key>')
api.add_resource(Distribution, '/distributions')
api.add_resource(Artifact, '/artifacts')
api.add_resource(PolarChart, '/polar-charts')


@parser.error_handler
def handle_request_parsing_error(err):
    abort(422, errors=err.messages)
