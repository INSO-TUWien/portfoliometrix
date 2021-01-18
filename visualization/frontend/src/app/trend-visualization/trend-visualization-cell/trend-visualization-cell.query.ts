import { QueryEntity } from '@datorama/akita';
import { TrendVisualizationCellState, TrendVisualizationCellStore } from './trend-visualization-cell.store';
import { TrendVisualizationCellEntity } from './trend-visualization-cell.entity';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class TrendVisualizationCellQuery extends QueryEntity<TrendVisualizationCellState, TrendVisualizationCellEntity> {
    constructor(store: TrendVisualizationCellStore) {
        super(store);
    }
}
