import { ApiService } from '../provider/api.service';
import { HealthStateStore } from './health-state.store';
import { ProjectQuery } from '../project/project.query';
import { MetricQuery } from '../metric/metric.query';
import { HealthStateDto, convertHealthStateDtoToEntity } from './health-state.entity';
import { Injectable } from '@angular/core';
import { HealthIndicatorEntity } from '../health-indicator/health-indicator.entity';

@Injectable({ providedIn: 'root' })
export class HealthStateService {

    constructor(
        private readonly _store: HealthStateStore,
        private readonly _apiService: ApiService,
        private readonly _projectQuery: ProjectQuery,
        private readonly _metricQuery: MetricQuery
    ) { }

    public calculateHealthStateForPortfolio(portfolioId: string) {
        this._apiService.get<HealthStateDto[]>('portfolio-health-state', {
            portfolio: portfolioId
        }).subscribe(
            dtos => {
                const entities = dtos.map(dto => convertHealthStateDtoToEntity(
                    dto,
                    this._projectQuery,
                    this._metricQuery,
                    dto.affectsHealth));
                this._store.setHealthStates(entities);
            }
        );
    }

    public calculateNewHealthState(indicator: HealthIndicatorEntity) {
        // if portfolio indicator, update the health state for the whole portfolio
        // otherwise only for a single project
        if (indicator.targetType === 'Portfolio') {
            this.calculateHealthStateForPortfolio(indicator.targetId);
        } else {
            this._apiService.get<HealthStateDto[]>('project-health-state', {
                project: indicator.targetId,
                indicator: indicator.id
            }).subscribe(
                dtos => {
                    const entities = dtos.map(dto => convertHealthStateDtoToEntity(
                        dto,
                        this._projectQuery,
                        this._metricQuery,
                        dto.affectsHealth));
                    // update/insert the health states here only for the project
                    this._store.updateHealthStatesForProject(indicator.targetId, entities);
                }
            );
        }
    }
}
