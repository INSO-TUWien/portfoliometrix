from injector import inject
from backend_application.repository import DatabaseRepository



class HealthIndicatorService:
    @inject
    def __init__(self, repository: DatabaseRepository):
        self.repository = repository

    def get_health_indicators(self, portfolio_id):
        portfolio_indicators = self.__get_portfolio_health_indicators(portfolio_id)
        # no portfolio indicator, always create one
        if len(portfolio_indicators) == 0:
            portfolio_indicator = {
                'name': portfolio_id,
                'rules': []
            }
            portfolio_indicator = self.__create_portfolio_health_indicator(portfolio_id, portfolio_indicator)
        else:
            portfolio_indicator = portfolio_indicators[0]
        portfolio_indicator['targetType'] = 'Portfolio'
        portfolio_indicator['targetId'] = portfolio_id
        project_indicators = self.__get_project_health_indicators(portfolio_id)
        for project_indicator in project_indicators:
            project_indicator['targetType'] = 'Project'
            project_indicator['targetId'] = project_indicator['project']

        return [portfolio_indicator] + project_indicators

    def create_or_update_indicator(self, indicator):
        # portfolio indicators should always exist
        # if the indicator does not have an id, we must create one for the project
        target_type = indicator['targetType']
        target_id = indicator['targetId']
        if 'id' not in indicator:
            if target_type == 'Portfolio':
                # this should never happen
                raise Exception('portfolio indicator should never be created manually')
            else:
                result_indicator = self.__create_project_health_indicator(target_id,indicator)
        else:
            # update existing indicator
            if target_type == 'Portfolio':
                self.__delete_portfolio_health_indicator(indicator['id'])
                result_indicator = self.__create_portfolio_health_indicator(target_id, indicator)
            else:
                self.delete_project_health_indicator(indicator['id'])
                result_indicator = self.__create_project_health_indicator(target_id, indicator)
        result_indicator['targetType'] = target_type
        result_indicator['target_id'] = target_id
        return result_indicator

    def __get_portfolio_health_indicators(self, portfolio_id):
        indicators = self.repository.get_portfolio_health_indicators(portfolio_id)
        return indicators

    def __get_project_health_indicators(self, portfolio_id):
        indicators = self.repository.get_project_health_indicators(portfolio_id)
        return indicators

    def __create_portfolio_health_indicator(self, portfolio_id, indicator):
        indicator = self.repository.create_portfolio_indicator(portfolio_id, indicator)
        return indicator

    def __delete_portfolio_health_indicator(self, indicator_id):
        self.repository.delete_portfolio_indicator(indicator_id)
        return True

    def __create_project_health_indicator(self, project_id, indicator):
        indicator = self.repository.create_project_indicator(project_id, indicator)
        return indicator

    def delete_project_health_indicator(self, indicator_id):
        self.repository.delete_project_indicator(indicator_id)

