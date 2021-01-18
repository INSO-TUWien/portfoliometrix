import enum
from injector import inject
from backend_application.repository import DatabaseRepository
from typing import List
import numpy as np
import pandas as pd

class HealthState(enum.Enum):
    # value is higher/lower than threshold
    Critical = 'Critical',
    # value is in notification area, but trend goes to threshold
    Worsening = 'Worsening',
    # value is in notification area, but trend goes away from threshold
    Improving = 'Improving'
    # value is not in threshold and not in notification area
    Good = 'Good',
    # value is used if state is in notification area, but no trend is calculated
    Warning = 'Warning'


class HealthStateService:
    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    def calculate_health_state_for_all_snapshots(self, portfolio_id):
        project_and_indicators = self.repository.collect_indicators_per_project(portfolio_id)
        violations = self.repository.calculate_health_state_per_snapshot(project_and_indicators)
        result = []
        for violation in violations:
            snapshot_health = {
                'index': violation['snapshot'],
                'projects': []
            }
            for project in violation['projects']:
                health_state = HealthState.Good
                metrics = []
                is_critical = any([data['lower_violation'] or data['upper_violation'] for data in project['data']])
                if is_critical:
                    metrics = [data['rule']['metric_id'] for data in project['data'] if  data['lower_violation'] or data['upper_violation']]
                    health_state = HealthState.Critical
                else:
                    is_warning = any([data['lower_notification'] or data['upper_notification'] for data in project['data']])
                    if is_warning:
                        metrics = [data['rule']['metric_id'] for data in project['data'] if data['lower_notification'] or data['upper_notification']]
                        health_state = HealthState.Warning
                snapshot_health_per_project = {
                    'projectId': project['id'],
                    'health': health_state.name,
                    'violations': metrics
                }
                snapshot_health['projects'].append(snapshot_health_per_project)
            result.append(snapshot_health)
        return result

    def __calculate_health_state(self, project_and_indicators):
        recent_snapshot_count = 5
        snapshot_indices = self.repository.get_last_snapshot_indices(recent_snapshot_count)
        threshold_violations = self.repository.calculate_health_for_projects(project_and_indicators,
                                                                             snapshot_indices)
        result = []
        for violation in threshold_violations:
            is_reverse = violation['reverse_thresholds']
            if violation['lower_threshold_violation_percent'] > 50:
                state = HealthState.Critical
            elif violation['upper_threshold_violation_percent'] > 50:
                state = HealthState.Critical
            elif violation['notification_lower_threshold_percent'] > 50:
                # since the data starts with the latest entry, we have to reverse the
                # list before calculating the trend
                data = reversed(violation['recent_data'])
                slope = self.__calculate_trend(data, recent_snapshot_count)
                # trend should increase, unless is_reverse is set
                is_ok = slope > 0 if not is_reverse else slope < 0
                state = HealthState.Improving if is_ok else HealthState.Worsening
            elif violation['notification_upper_threshold_percent'] > 50:
                data = list((violation['recent_data']))
                data.reverse()
                slope = self.__calculate_trend(data, recent_snapshot_count)
                is_ok = slope < 0 if not is_reverse else slope > 0
                state = HealthState.Improving if is_ok else HealthState.Worsening
            else:
                state = HealthState.Good
            result.append({
                'project': violation['project'],
                'metric': violation['metric'],
                'rule': violation['rule'],
                'state': state.name,
                'affectsHealth': violation['affects_health']
            })
        return result

    def calculate_project_health(self, project_id, indicator_id):
        result = self.__calculate_health_state([{
            'project': project_id,
            'indicator': indicator_id
        }])
        return result

    def calculate_portfolio_health(self, portfolio_id):
        project_and_indicators = self.repository.collect_indicators_per_project(portfolio_id)
        result = self.__calculate_health_state(project_and_indicators)
        return result

    @staticmethod
    def __calculate_trend(data, snapshot_count):
        """calculates the trend of the given data points.
        The given curve is first flattened by using a moving average
        and calculating a line by using polynomial interpolation with degree 1.
        The calculated slope of the line can be used to identify the trend,
        a negative slope indicates a decreasing trend, a positive slope an increasing"""
        window_size = 3
        numbers_series = pd.Series(data)
        windows = numbers_series.rolling(window_size)
        moving_averages = windows.mean()
        ind = range(0, snapshot_count - (window_size - 1))
        coefficients = np.polyfit(ind, moving_averages[window_size - 1:], 1)
        slope = coefficients[-2]
        return slope
