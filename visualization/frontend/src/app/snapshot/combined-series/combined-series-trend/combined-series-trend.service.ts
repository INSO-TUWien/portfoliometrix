import { SnapshotMetricSelectionQuery } from '../../snapshot-metric-selection/snapshot-metric-selection.query';
import { ProjectSelectionQuery } from '../../project-selection/project-selection.query';
import { combineLatest, Observable, of, forkJoin } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/provider/api.service';
import { filter, map, flatMap, switchMap } from 'rxjs/operators';
import { TrendSeriesDto, convertDtoToSeries } from 'src/app/trend-visualization/trend-visualization-series.entity';
import { CombinedTrendSeriesStore } from './combined-series-trend.store';
import { ProjectQuery } from 'src/app/project/project.query';
import { CombinedTrendSeriesEntity } from './combined-series-trend.entity';
import { CombinedSeriesTrendQuery } from './combined-series-trend.query';
import { TrendRangeService } from 'src/app/provider/trend-range.service';
import { TrendVisualizationControl } from 'src/app/trend-visualization/trend-visualization-control/trend-visualization-control';
import { HealthIndicatorEntity, getReferenceLinesForIndicatorWithProjectName } from 'src/app/health-indicator/health-indicator.entity';
import { HealthIndicatorQuery } from 'src/app/health-indicator/health-indicator.query';

@Injectable({ providedIn: 'root' })
export class CombinedSeriesTrendService {

    /**
     * recalculate the trend series every time
     * the snapshots, metrics or controls change
     */
    private _trendSeriesChangeTrigger$ = combineLatest(
        [this._snapshotMetricSelectionQuery.selectionForCombinedSeries$,
        this._projectSelectionQuery.selectAll(),
        this._trendQuery.visualizationControls$]).pipe(
            filter(tuple => tuple[0] !== undefined),
            filter(tuple => tuple[1].length > 0),
            map( tuple => ({
                selectedProjects: tuple[1].filter(x => x.isSelected).map(x => x.id),
                selectedMetrics: tuple[0].selection.filter(x => x.isSelected).map(x => x.id),
                controls: tuple[2]
            }))
        );

    constructor(
        private readonly _snapshotMetricSelectionQuery: SnapshotMetricSelectionQuery,
        private readonly _projectSelectionQuery: ProjectSelectionQuery,
        private readonly _apiService: ApiService,
        private readonly _store: CombinedTrendSeriesStore,
        private readonly _projectQuery: ProjectQuery,
        private readonly _trendQuery: CombinedSeriesTrendQuery,
        private readonly _rangeService: TrendRangeService,
        private readonly _indicatorQuery: HealthIndicatorQuery) {

        this._snapshotMetricSelectionQuery.selectionForCombinedSeries$.pipe(
            filter(metric => !!metric)
        ).subscribe(
            metric => {
                const controls = this._store.getValue().visualizationControls;
                const changedControls = controls.updateByMetrics(metric.selection);
                this.updateControls(changedControls);
            }
        );

        this.registerForTrendSeriesChanges();
        this.registerForScalingChanges();
        this.registerForReferenceLineChanges();
    }

    private registerForScalingChanges() {
        this._trendSeriesChangeTrigger$.pipe(
            flatMap(tuple => {
                const isScaled = tuple.controls.uniformScale;
                if (!isScaled) {
                    return of(undefined);
                }
                if (tuple.selectedMetrics.length === 0 || tuple.selectedProjects.length === 0) {
                    return of(undefined);
                }
                return this._rangeService.getScaling(
                    tuple.selectedProjects,
                    tuple.selectedMetrics,
                    tuple.controls);
            })
        ).subscribe(range => {
            if (range === undefined) {
                this._store.clearRange();
            } else {
                this._store.updateRange(range);
            }
        });
    }

    private registerForTrendSeriesChanges() {
        // react on changes of the metric and the projects
        this._trendSeriesChangeTrigger$.pipe(
            flatMap(tuple => {
                if(tuple.selectedMetrics.length === 0 ||
                    tuple.selectedProjects.length === 0) {
                    return of([]);
                }
                // create an API call for every project
                // sending all at once would be better, but in this way,
                // we can reuse the existing API
                const trendSeries: Observable<TrendSeriesDto>[] = [];
                tuple.selectedProjects.forEach(projectSelection => {
                    trendSeries.push(this._apiService.get<TrendSeriesDto>('trends', {
                        project: projectSelection,
                        metrics: tuple.selectedMetrics,
                        controls: JSON.stringify(tuple.controls)
                    }));
                });
                return forkJoin(trendSeries);
            })
        ).subscribe(dtos => {
            const series: CombinedTrendSeriesEntity[] = [];
            const controls = this._trendQuery.getValue().visualizationControls;
            dtos.forEach((dto, index) => {
                const project = this._projectQuery.getEntity(dto.project);
                const innerSeries = convertDtoToSeries(dto, controls);
                innerSeries.forEach((s, innerIndex) => {
                    s.name = `${project.name} - ${s.name}`;
                    const seriesEntity: CombinedTrendSeriesEntity = {
                        id: `${index}${innerIndex}`,
                        ...s,
                        project: project.name
                    };
                    series.push(seriesEntity);
                });
            });
            this._store.set(series);
        }
        );
    }

    private registerForReferenceLineChanges() {
        const referenceLineChanges$ = 
            this._trendSeriesChangeTrigger$.pipe(
                map(trigger => {
                    return {
                        indicators: trigger.selectedProjects.map(
                            p => this._indicatorQuery.getProjectIndicator(p)),
                        metrics: trigger.selectedMetrics, 
                        controls: trigger.controls
                    };
                })
            );
        
        referenceLineChanges$.subscribe(input => {
            this.updateReferenceLines(
                input.indicators,
                input.controls,
                input.metrics
            );
        });
    }      

    private updateReferenceLines(
        indicators: HealthIndicatorEntity[],
        controls: TrendVisualizationControl,
        selectedMetrics: string[]) {
        let referenceLines = [];
        //if (controls.showThresholds) {
            // collect project specific reference lines
            indicators
                .filter(x => x !== undefined && x.targetType === 'Project')
                .forEach(indicator => {
                    const project = this._projectQuery.getEntity(indicator.targetId);
                    referenceLines = referenceLines.concat(
                        getReferenceLinesForIndicatorWithProjectName(
                            indicator,
                            selectedMetrics,
                            project.name
                        )
                    );
                });
            // store the portfolio indicator only once
            const portfolioIndicators = 
                indicators.filter(x => x !== undefined && x.targetType === 'Portfolio');
            if (portfolioIndicators.length > 0) {
                referenceLines = referenceLines.concat(
                    getReferenceLinesForIndicatorWithProjectName(
                        portfolioIndicators[0],
                        selectedMetrics,
                        'Portfolio'
                    )
                );
            }
        //} 
        this._store.updateReferenceLines(referenceLines);
    }

    public updateSnapshotPosition(index: number) {
        this._store.selectSnapshotByIndex(index);
    }

    public updateControls(controls: TrendVisualizationControl) {
        this._store.updateControls(controls);
    }
}
