import { QueryEntity } from '@datorama/akita';
import { map, first, catchError, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HealthIndicatorState, HealthIndicatorStore } from './health-indicator.store';
import { HealthIndicatorEntity, ReferenceLine, getReferenceLinesForIndicator } from './health-indicator.entity';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class HealthIndicatorQuery extends QueryEntity<HealthIndicatorState, HealthIndicatorEntity> {
    constructor(store: HealthIndicatorStore) {
        super(store);
    }

    portfolioIndicator$ = this.select(x => x.portfolioIndicator).pipe(filter(x => x !== undefined));

    public selectProjectIndicator(projectId: string): Observable<HealthIndicatorEntity> {
        const result$ = this.selectAll({filterBy: x => x.targetId === projectId}).pipe(
            map(x => {
                if (x.length > 0) {
                    return x[0];
                } else {
                    return this.getValue().portfolioIndicator;
                }
            }),
            catchError(_ => {
                return this.select(x => x.portfolioIndicator);
            })
        );
        return result$;
    }

    public getProjectIndicator(projectId: string): HealthIndicatorEntity {
        const projectIndicators = this.getAll({ filterBy: x => x.targetId === projectId });
        if (projectIndicators.length > 0) {
            return projectIndicators[0];
        }
        return this.getValue().portfolioIndicator;
    }

    public getReferenceLines(projectId: string, metrics: string[]): ReferenceLine[] {
        const indicator = this.getProjectIndicator(projectId);
        return getReferenceLinesForIndicator(indicator, metrics);
    }
}
