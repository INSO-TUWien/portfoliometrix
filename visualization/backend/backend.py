from injector import Binder
from backend_application.api import app
from flask_injector import FlaskInjector
from backend_application.service import ProjectService, MetricsService, SnapshotService, \
    TrendService, RangeService, HealthIndicatorService, DistributionService, ArtifactService, PolarChartService
from backend_application.repository import db_repository


def configure(binder: Binder) -> Binder:
    """
    registers services and repository in DI container,
    use @inject at __init__ method to inject
    the service into classes
    """
    binder.bind(
        db_repository.DatabaseRepository,
        db_repository.DatabaseRepository
    )
    binder.bind(
        ProjectService,
        ProjectService
    )
    binder.bind(
        MetricsService,
        MetricsService
    )
    binder.bind(
        SnapshotService,
        SnapshotService
    )
    binder.bind(
        TrendService,
        TrendService
    )
    binder.bind(
        RangeService,
        RangeService
    )
    binder.bind(
        HealthIndicatorService,
        HealthIndicatorService
    )
    binder.bind(
        DistributionService,
        DistributionService
    )
    binder.bind(
        ArtifactService,
        ArtifactService
    )
    binder.bind(
        PolarChartService,
        PolarChartService
    )

FlaskInjector(
    app=app,
    modules=[configure]
)
