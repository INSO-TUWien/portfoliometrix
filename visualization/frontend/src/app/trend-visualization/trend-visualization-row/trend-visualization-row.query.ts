import { QueryEntity } from '@datorama/akita';
import { TrendVisualizationRowState, TrendVisualizationRowStore } from './trend-visualization-row.store';
import { TrendVisualizationRowEntity } from './trend-visualization-row.entity';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class TrendVisualizationRowQuery extends QueryEntity<TrendVisualizationRowState, TrendVisualizationRowEntity> {
    constructor(protected readonly store: TrendVisualizationRowStore) { super(store); }
    public rows$ = this.selectAll();
}
