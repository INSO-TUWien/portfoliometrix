import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/provider/api.service';
import { SnapshotMetricSelectionQuery } from '../snapshot-metric-selection/snapshot-metric-selection.query';
import { ProjectSelectionQuery } from '../project-selection/project-selection.query';
import { PolarChartDataStore } from './polar-chart.store';
import { combineLatest, of, Observable } from 'rxjs';
import { filter, flatMap, map } from 'rxjs/operators';
import { PolarChartDataPerSnapshotEntity, PolarChartDataDto } from './polar-chart.entity';
import { PolarChartDataQuery } from './polart-chart.query';

@Injectable({ providedIn: 'root' })
export class PolarChartDataService {
    constructor(
        private readonly _apiService: ApiService,
        private readonly _polarChartDataQuery: PolarChartDataQuery,
        metricSelectionQuery: SnapshotMetricSelectionQuery,
        projectSelectionQuery: ProjectSelectionQuery,
        private readonly _store: PolarChartDataStore) {

        combineLatest([
            metricSelectionQuery.selectionForPolarChart$,
            projectSelectionQuery.onlySelectedProjects$
        ]).pipe(
            filter(([metrics, _]) => metrics !== undefined),
            flatMap(([metrics, projects]) => {
                const metricIds = metrics.selection
                    .filter(x => x.isSelected)
                    .map(x => x.id);
                const projectIds = projects
                    .filter(x => x.isSelected)
                    .map(x => x.id);

                if (metricIds.length === 0 || projectIds.length === 0) {
                    return of([]);
                }

                return this.loadPolarChartData(metricIds, projectIds);
            })
        ).subscribe(
            polarChartData => {
                this._store.set(polarChartData);
                this._store.updateValidMetric(polarChartData.length > 0);
            }
        );
    }

    public loadPolarChartData(metricIds: string[], projectIds: string[]): Observable<PolarChartDataPerSnapshotEntity[]> {
        return this._apiService.get<PolarChartDataDto[]>('polar-charts', {
            projects: projectIds,
            metrics: metricIds
        }).pipe(
            map(dtos => {
                const polarChartData: PolarChartDataPerSnapshotEntity[] = dtos.map(dto => ({
                    id: dto.snapshot - 1,
                    polarChartDataPerProject: dto.data.map(d => ({
                        name: d.project,
                        series: d.series.map(s => ({name: s.metric_id, value: s.normalized_value}))
                    }))
                }));
                return polarChartData;
            })
        );
    }

    public expandOrCollapse() {
        const isExpanded = this._polarChartDataQuery.getValue().isExpanded;
        this._store.expandOrCollapse(!isExpanded);
    }
}
