import { QueryEntity } from '@datorama/akita';
import { MetricEntity } from './metric.entity';
import { MetricState, MetricStore } from './metric.store';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class MetricQuery extends QueryEntity<MetricState, MetricEntity> {

    public readonly colorMap: { [metric: string]: string } = {
        ['CountLineCode']: 'hsl(0, 75%, 58%)',
        ['RatioCommentToCode']: 'hsl(30, 75%, 58%)',
        ['MaxCyclomatic']: 'hsl(120, 75%, 58%)',
        ['PercentLackOfCohesion']: 'hsl(175, 75%, 58%)',
        ['CountClassCoupled']: 'hsl(230, 75%, 58%)',
        ['MaxInheritanceTree']: 'hsl(275, 75%, 58%)'
    };

    constructor(protected readonly store: MetricStore) {
        super(store);
    }
    public metrics$ = this.selectAll();
}
