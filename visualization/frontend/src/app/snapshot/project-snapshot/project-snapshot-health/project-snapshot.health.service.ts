import { ApiService } from 'src/app/provider/api.service';
import { combineLatest } from 'rxjs';
import { HealthIndicatorQuery } from 'src/app/health-indicator/health-indicator.query';
import { map, filter, switchMap } from 'rxjs/operators';
import { SnapshotHealthDto } from './project-snapshot-health.entity';
import { SnapshotHealthStore } from './project-snapshot-health.store';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SnapshotHealthService {
    constructor(
        private readonly _healthIndicatorQuery: HealthIndicatorQuery,
        private readonly _store: SnapshotHealthStore,
        private readonly _apiService: ApiService) {
    }

    public start() {
        // load all violations up front (won't this be too much?)
        // But we would also need it to show hot spots later
        combineLatest([
            this._healthIndicatorQuery.portfolioIndicator$,
            this._healthIndicatorQuery.selectAll()
        ]).pipe(
            filter(([portfolioIndicator, _]) => {
                return portfolioIndicator !== undefined;
            }),
            switchMap(([portfolioIndicator, _]) => {
                return this._apiService.get<SnapshotHealthDto[]>('snapshot-health-state', {
                    portfolio: portfolioIndicator.targetId
                });
            }),
            map(dtos => {
                const snapshotHealthStates = dtos.map(dto => ({
                    id: dto.index,
                    projectHealthStates: dto.projects
                }));
                return snapshotHealthStates;
            })
        ).subscribe(entities => {
            this._store.set(entities);
        });
    }
}
