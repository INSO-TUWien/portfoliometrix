import { EntityState, StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { TrendVisualizationCellEntity } from './trend-visualization-cell.entity';

export interface TrendVisualizationCellState extends EntityState<TrendVisualizationCellEntity> {
}
@StoreConfig({name: 'TrendVisualizationCell'})
@Injectable({providedIn: 'root'})
export class TrendVisualizationCellStore extends EntityStore<TrendVisualizationCellState, TrendVisualizationCellEntity> {
    constructor() {
        super({});
    }
}
