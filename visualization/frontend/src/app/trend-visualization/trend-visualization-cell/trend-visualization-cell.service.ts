import { TrendVisualizationCellStore } from './trend-visualization-cell.store';
import { TrendVisualizationCellEntity } from './trend-visualization-cell.entity';
import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/provider/api.service';
import { TrendSeriesDto, convertDtoToSeries } from '../trend-visualization-series.entity';
import { TrendVisualizationControl } from '../trend-visualization-control/trend-visualization-control';
import { HealthIndicatorQuery } from 'src/app/health-indicator/health-indicator.query';
import { HealthIndicatorEntity, getReferenceLinesForIndicator } from 'src/app/health-indicator/health-indicator.entity';
import { of, Observable, forkJoin } from 'rxjs';
import { flatMap, map, toArray } from 'rxjs/operators';
import { ProjectQuery } from 'src/app/project/project.query';
import { sorting } from 'src/app/project/project.store';

@Injectable({ providedIn: 'root' })
export class TrendVisualizationCellService {
    constructor(
        private readonly _store: TrendVisualizationCellStore,
        private readonly _api: ApiService,
        private readonly _indicatorQuery: HealthIndicatorQuery,
        private readonly _projectQuery: ProjectQuery) { }

    public updateReferenceLine(
        cell: TrendVisualizationCellEntity,
        indicator: HealthIndicatorEntity,
        controls: TrendVisualizationControl) {
        let referenceLines = [];
        if (controls.showThresholds) {
            referenceLines = getReferenceLinesForIndicator(
                indicator,
                cell.metrics.filter(x => x.isSelected).map(x => x.id));
        }
        this._store.update(cell.id, { referenceLines });
    }

    public setupAndAddCells(cells: TrendVisualizationCellEntity[], controls: TrendVisualizationControl): void {
        cells.forEach(cell => {
            if (controls.showThresholds) {
                cell.referenceLines = this._indicatorQuery.getReferenceLines(
                    cell.project.id,
                    cell.metrics.filter(x => x.isSelected).map(x => x.id)
                );
            } else {
                cell.referenceLines = [];
            }
        });
        of(cells).pipe(
            flatMap(x => x),
            flatMap(cell => {
                const request = this._api.get<TrendSeriesDto>('trends', {
                    project: cell.project.id,
                    metrics: cell.metrics.filter(x => x.isSelected).map(x => x.id),
                    controls: JSON.stringify(controls)
                }).pipe(
                    map(dto => ({ cell, dto }))
                );
                return request;
            }),
            toArray(),
            // flatMap(x => this.sortByProject(x, sortOrder))
        ).subscribe(
            result => {
                result.forEach(data => {
                        const series = convertDtoToSeries(data.dto, controls);
                        data.cell.series = series;
                        this._store.upsert(data.cell.id, data.cell);
                    });
            }
        );
    }

    public sortByProject(cells: TrendVisualizationCellEntity[]): Observable<TrendVisualizationCellEntity[]> {
        const cellsForSorting = cells.map(x => ({
            cell: x,
            projectId: x.project.id,
            projectName: x.project.name
        }));
        const sortOrder = this._projectQuery.getValue().sorting;
        const result$ = this._projectQuery.sortProjectsBySortOrder(
            sortOrder,
            cellsForSorting).pipe(map(x => x.map(c => c.cell)));
        return result$;
    }
}
