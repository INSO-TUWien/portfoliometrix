import { trendVisualizationRowFactory } from './trend-visualization-row.entity';
import { TrendVisualizationRowStore } from './trend-visualization-row.store';
import { Injectable } from '@angular/core';
import { MetricEntity, MetricChangeEvent } from '../../metric/metric.entity';
import { TrendVisualizationControl } from '../trend-visualization-control/trend-visualization-control';
import { TrendVisualizationRowQuery } from './trend-visualization-row.query';
import { ProjectQuery } from '../../project/project.query';
import { TrendRangeService } from 'src/app/provider/trend-range.service';

@Injectable({ providedIn: 'root' })
export class TrendVisualizationRowService {
    constructor(
        private readonly _store: TrendVisualizationRowStore,
        private readonly _rowQuery: TrendVisualizationRowQuery,
        private readonly _projectQuery: ProjectQuery,
        private readonly _rangeService: TrendRangeService) { }

    /**
     * gets the list of available metrics and creates
     * a visualization trend row per metric.
     * All rows will then be stored so that the container component
     * can start rendering it
     * @param metrics list of available metrics received from the backend
     */
    public createVisualizationRows(metrics: MetricEntity[]) {
        const rows = trendVisualizationRowFactory(metrics);
        this._store.add(rows);
    }

    public changeMetricSelection(rowId: number, changeEvent: MetricChangeEvent) {
        this._store.changeMetricSelection(rowId, changeEvent.id, changeEvent.isSelected);
        this.updateScaling(rowId);
    }

    public changeControls(rowId: number, controls: TrendVisualizationControl) {
        this._store.changeControls(rowId, controls);
        // check if uniform scale is active, if yes, also request scaling
        this.updateScaling(rowId, controls.uniformScale);
    }

    private updateScaling(rowId: number, isScaled?: boolean) {
        const row = this._rowQuery.getEntity(rowId);
        const projects = this._projectQuery.getAll();
        if (isScaled === undefined) {
            isScaled = row.controls.uniformScale;
        }
        if (isScaled) {
            this._rangeService.getScaling(
                projects.map(p => p.id),
                row.metrics.filter(m => m.isSelected).map(m => m.id),
                row.controls).subscribe(range => {
                    this._store.updateRange(rowId, range.min, range.max);
                });
        } else {
            this._store.clearRange(rowId);
        }
    }
}
