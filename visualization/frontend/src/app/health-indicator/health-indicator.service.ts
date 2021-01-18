import { HealthIndicatorEntity, healthIndicatorToDto, HealthIndicatorDto, dtoToHealthIndicator } from './health-indicator.entity';
import { HealthIndicatorStore } from './health-indicator.store';
import { Injectable } from '@angular/core';
import { ApiService } from '../provider/api.service';
import { MetricQuery } from '../metric/metric.query';
import { HealthStateService } from '../health-state/health-state.service';
import { HealthIndicatorQuery } from './health-indicator.query';
import { ProjectService } from '../project/project.service';

@Injectable({providedIn: 'root'})
export class HealthIndicatorService {

    constructor(
        private readonly _store: HealthIndicatorStore,
        private readonly _healthStateService: HealthStateService,
        private readonly _apiService: ApiService,
        private readonly _metricQuery: MetricQuery,
        private readonly _indicatorQuery: HealthIndicatorQuery,
        private readonly _projectService: ProjectService) {}


    public loadIndicators(portfolioId: string) {
        this._apiService.get<HealthIndicatorDto[]>('health-indicators', {
            portfolio: portfolioId
        }).subscribe(dtos => {
            const indicators = dtos.map(dto => dtoToHealthIndicator(dto, this._metricQuery));
            this._store.setHealthIndicators(indicators);
            // start calculation of health state
            if (indicators.length > 0) {
                this._healthStateService.calculateHealthStateForPortfolio(portfolioId);
            }
        });
    }

    public deleteHealthIndicator(healthIndicator: HealthIndicatorEntity) {
        this._apiService.delete('health-indicators', {
            indicator_id: healthIndicator.id
        }).subscribe(
            _ => {
                const portfolioIndicator = this._indicatorQuery.getValue().portfolioIndicator;
                this._healthStateService.calculateNewHealthState(portfolioIndicator);
                this._store.remove(healthIndicator.id);
            }
        );
    }

    public createOrUpdateIndicator(healthIndicator: HealthIndicatorEntity) {
        this._apiService.put<{indicator: string}, HealthIndicatorDto>('health-indicators', {
            indicator: JSON.stringify(healthIndicatorToDto(healthIndicator))
        }).subscribe(
                dto => {
                    const changedIndicator = dtoToHealthIndicator(dto, this._metricQuery);
                    this._store.updateIndicator(changedIndicator);
                    this._healthStateService.calculateNewHealthState(changedIndicator);
                }
            );
    }
}
