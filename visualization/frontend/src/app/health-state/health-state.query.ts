import { QueryEntity } from '@datorama/akita';
import { HealthStateState, HealthStateStore } from './health-state.store';
import { HealthStateEntity, OverallHealthStateByMetric, HealthState, OverallHealthState } from './health-state.entity';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import arrayToSentence from 'array-to-sentence';

export interface HealthStateQuery {
    /**
     * iterates over all calculated health states and
     * returns the one which has the worst state
     * @param id can either belong to a portfolio or to a single project
     */
    getWorstHealthStateForEntity(entityId: string): Observable<OverallHealthState>;
    /**
     * returns the worst health state for the given entity
     * grouped by metrics
     * @param entityId either project or portfolio
     */
    getWorstHealthStatePerMetrics(entityId: string): Observable<OverallHealthStateByMetric[]>;
}

/** Mixin provides common functionality which can be reused */
class HealthStateQueryMixin {
    public getWorstHealthStateForEntityInternal(
        availableHealthState$: Observable<HealthStateEntity[]>,
        // dictionary returns text tooltips depending on the health state
        messageDictionary: Map<HealthState, (metricNames: string[], projectNames: string[]) => string>): Observable<OverallHealthState> {
        const result$ = availableHealthState$.pipe(
            map(healthStates => {
                const healthByState = new Map<HealthState, HealthStateEntity[]>();
                healthByState.set('Critical', []);
                healthByState.set('Worsening', []);
                healthByState.set('Improving', []);
                healthByState.set('Good', []);
                healthStates.forEach(state => {
                    healthByState.get(state.state).push(state);
                });
                let result: OverallHealthState;
                const states: HealthState[] = ['Critical', 'Worsening', 'Improving', 'Good'];
                for (const state of states) {
                    const collectedStates = healthByState.get(state);
                    if (collectedStates.length > 0) {
                        const metricNames = arrayToSentence(collectedStates.map(x => x.metric.name));
                        const projectNames = arrayToSentence(collectedStates.map(x => x.project.name));
                        result = {
                            state,
                            message: messageDictionary.get(state)(metricNames, projectNames)
                        };
                        break;
                    }
                }
                if (result === undefined) { // no result means nothing was calculated
                    result = {
                        message: 'The state has not been calculated yet',
                        state: 'NotCalculated'
                    };
                }
                return result;
            })
        );
        return result$;
    }

    public getWorstHealthStateByMetricInternal(
        availableHealthState$: Observable<HealthStateEntity[]>,
        // dictionary returns text tooltips depending on the health state
        messageDictionary: Map<HealthState, (metricNames: string[], projectNames: string[]) => string>): 
        Observable<OverallHealthStateByMetric[]> {
        const result$ = availableHealthState$.pipe(map(states => {
            const byMetric = groupBy<string, HealthStateEntity>(states, x => x.metric.id);
            const result: OverallHealthStateByMetric[] = [];
            byMetric.forEach((v, k, _) => {
                this.getWorstHealthStateForEntityInternal(of(v), messageDictionary).subscribe(stateForMetric => {
                    result.push({
                        ...stateForMetric,
                        metricId: k
                    });
                });
            });
            return result;
        }));
        return result$;
    }
}

@Injectable({ providedIn: 'root' })
export class ProjectHealthStateQuery extends QueryEntity<HealthStateState, HealthStateEntity> implements HealthStateQuery {
    constructor(store: HealthStateStore) {
        super(store);
    }

    private _mixin = new HealthStateQueryMixin();

    /**
     * iterate overall health states for this project and return the one with the
     * worst state
     * @param entityId project id
     */
    public getWorstHealthStateForEntity(entityId: string): Observable<OverallHealthState> {
        const result$ = this._mixin.getWorstHealthStateForEntityInternal(
            this.selectAll({ filterBy: x => x.project.id === entityId }),
            new Map([
                ['Critical', (m, _) => `Critical: Threshold is violated by: ${m}`],
                ['Worsening', (m, _) => `Metrics are getting worse: ${m}`],
                ['Improving', (m, _) => `Metrics are getting better: ${m}`],
                ['Good', (_, __) => 'All metrics are within the parameters']
            ])
        );
        return result$;
    }
    getWorstHealthStatePerMetrics(entityId: string): Observable<OverallHealthStateByMetric[]> {
        const result$ = this._mixin.getWorstHealthStateByMetricInternal(
            this.selectAll({ filterBy: x => x.project.id === entityId }),
            new Map([
                ['Critical', (_, __) => `Critical: Threshold is violated`],
                ['Worsening', (_, __) => `Metric is getting worse`],
                ['Improving', (_, __) => `Metric is getting better`],
                ['Good', (_, __) => 'Metric is within parameters']
            ])
        );
        return result$;
    }
}

@Injectable({ providedIn: 'root' })
export class PortfolioHealthStateQuery extends QueryEntity<HealthStateState, HealthStateEntity> implements HealthStateQuery {
    constructor(store: HealthStateStore) {
        super(store);
    }

    private _mixin = new HealthStateQueryMixin();

    public getWorstHealthStateForEntity(entityId: string): Observable<OverallHealthState> {
        // since we currently have only one active portfolio, that means
        // that all health states are for this portfolio, so simply collect them
        const result$ = this._mixin.getWorstHealthStateForEntityInternal(
            this.selectAll({filterBy: x => x.affectsHealth}),
            new Map([
                ['Critical', (m, p) => `Critical: Threshold is violated by ${p}(${m})`],
                ['Worsening', (m, p) => `Trend is getting worse for ${p}(${m})`],
                ['Improving', (m, p) => `Trend is getting better for ${p}(${m})`],
                ['Good', (_, __) => 'All projects are within the parameters']
            ]));
        return result$;
    }

    public getWorstHealthStatePerMetrics(entityId: string) {
        // since we currently have only one active portfolio, that means
        // that all health states are for this portfolio, so simply collect them
        const result$ = this._mixin.getWorstHealthStateByMetricInternal(
            this.selectAll({filterBy: x => x.affectsHealth}),
            new Map([
                ['Critical', (_, p) => `Critical: Threshold is violated by ${p}`],
                ['Worsening', (_, p) => `Trend is getting worse for ${p}`],
                ['Improving', (_, p) => `Trend is getting better for ${p}`],
                ['Good', (_, __) => 'All projects are within the parameters']
            ]));
        return result$;
    }
}

function groupBy<TKey, TItem>(list: TItem[], keyGetter: (item: TItem) => TKey) {
    const map = new Map<TKey, TItem[]>();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

