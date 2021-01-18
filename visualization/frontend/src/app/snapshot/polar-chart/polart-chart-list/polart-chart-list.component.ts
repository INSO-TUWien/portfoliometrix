import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PolarChartDataPerSnapshotEntity, PolarChartDataForProject } from '../polar-chart.entity';
import { SnapshotMetricSelectionService } from '../../snapshot-metric-selection/snapshot-metric-selection.service';
import { SnapshotMetricSelectionQuery } from '../../snapshot-metric-selection/snapshot-metric-selection.query';
import { ProjectSelectionQuery } from '../../project-selection/project-selection.query';
import { CombinedSeriesTrendQuery } from '../../combined-series/combined-series-trend/combined-series-trend.query';
import { flatMap, filter, map } from 'rxjs/operators';
import { PolarChartDataQuery } from '../polart-chart.query';
import { PolarChartDataService } from '../polar-chart.service';
import { ProjectSnapshotQuery } from '../../project-snapshot/project-snapshot.query';
import { MetricChangeEvent } from 'src/app/metric/metric.entity';

@Component({
  selector: 'app-polart-chart-list',
  templateUrl: './polart-chart-list.component.html',
  styleUrls: ['./polart-chart-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolartChartListComponent implements OnInit {

  public metricSelection$ = this._snapshotMetricSelectionQuery.selectionForPolarChart$;
  private _polarChartDataForCurrentSnapshot$: Observable<PolarChartDataPerSnapshotEntity>;
  public isMetricValid$ = this._polarChartQuery.hasValidMetric$;
  public isExpanded$ = this._polarChartQuery.isExpanded$;
  public selectedProjects$ = this._projectSelectionQuery.onlySelectedProjects$;
  public tileWidth$ = this._projectSnapshotQuery.projectTileWidth$;

  constructor(
    private readonly _metricSelectionService: SnapshotMetricSelectionService,
    private readonly _snapshotMetricSelectionQuery: SnapshotMetricSelectionQuery,
    private readonly _projectSelectionQuery: ProjectSelectionQuery,
    private readonly _trendQuery: CombinedSeriesTrendQuery,
    private readonly _polarChartQuery: PolarChartDataQuery,
    private readonly _polarChartService: PolarChartDataService,
    private readonly _projectSnapshotQuery: ProjectSnapshotQuery) { }

  ngOnInit() {
    this._polarChartDataForCurrentSnapshot$ =
      this._trendQuery.selectedSnapshotIndex$.pipe(
        flatMap(index => this._polarChartQuery.selectPolarChartDataForSnapshot(index))
      );
  }

  public getPolarChartForProject(projectId: string): Observable<PolarChartDataForProject[]> {
      const result$ = this._polarChartDataForCurrentSnapshot$.pipe(
        flatMap(polarChartData => {
          // if no data provided for snapshot, return empty series
          if (polarChartData === undefined) {
            return [];

          } else {
            return polarChartData.polarChartDataPerProject;
          }
        }),
        filter(d => {
          return d.name === projectId;
        }),
        map(d => [d])
      );
      return result$;
  }

  public onMetricSelectionChanged(changeEvent: MetricChangeEvent) {
    this._metricSelectionService.updateMetricSelection('PolarChart', changeEvent);
  }

  public toggleExpanded() {
    this._polarChartService.expandOrCollapse();
  }
}
