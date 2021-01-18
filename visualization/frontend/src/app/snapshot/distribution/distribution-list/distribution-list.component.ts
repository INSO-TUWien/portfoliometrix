import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SnapshotMetricSelectionService } from '../../snapshot-metric-selection/snapshot-metric-selection.service';
import { SnapshotMetricSelectionQuery } from '../../snapshot-metric-selection/snapshot-metric-selection.query';
import { MetricChangeEvent } from 'src/app/metric/metric.entity';
import { DistributionService } from '../distribution.service';
import { DistributionQuery } from '../distribution.query';
import { DistributionPerSnapshotEntity, DistributionForProject, entityFilter } from '../distribution.entity';
import { Observable } from 'rxjs';
import { CombinedSeriesTrendQuery } from '../../combined-series/combined-series-trend/combined-series-trend.query';
import { flatMap, map, filter } from 'rxjs/operators';
import { DistributionStore } from '../distribution.store';
import { ProjectSelectionQuery } from '../../project-selection/project-selection.query';
import { ProjectSnapshotQuery } from '../../project-snapshot/project-snapshot.query';

@Component({
  selector: 'app-distribution-list',
  templateUrl: './distribution-list.component.html',
  styleUrls: ['./distribution-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionListComponent implements OnInit {

  public metricSelection$ = this._snapshotMetricSelectionQuery.selectionForDistribution$;
  public distributionForCurrentSnapshot$: Observable<DistributionPerSnapshotEntity>;
  public entityFilter$ = this._distributionQuery.currentFilter$;
  public isMetricValid$ = this._distributionQuery.hasValidMetric$;
  public isExpanded$ = this._distributionQuery.isExpanded$;
  public selectedProjects$ = this._projectSelectionQuery.onlySelectedProjects$;
  public tileWidth$ = this._projectSnapshotQuery.projectTileWidth$;

  constructor(
    private readonly _metricSelectionService: SnapshotMetricSelectionService,
    private readonly _snapshotMetricSelectionQuery: SnapshotMetricSelectionQuery,
    private readonly _projectSelectionQuery: ProjectSelectionQuery,
    private readonly _trendQuery: CombinedSeriesTrendQuery,
    private readonly _distributionQuery: DistributionQuery,
    private readonly _distributionService: DistributionService,
    private readonly _projectSnapshotQuery: ProjectSnapshotQuery) { }

  ngOnInit() {
    this.distributionForCurrentSnapshot$ =
      this._trendQuery.selectedSnapshotIndex$.pipe(
        flatMap(index => {
          return this._distributionQuery.selectDistributionForSnapshot(index).pipe(
            filter(x => x !== undefined)
          );
        })
      );
  }

  public getDistributionForProject(projectId: string) {
      const result$ = this.distributionForCurrentSnapshot$.pipe(
        map(distribution => distribution.distributionsPerProject),
        flatMap(distributions => distributions),
        filter(d => d.project === projectId),
        map(d => d.series)
      );
      return result$;
  }

  public onMetricSelectionChanged(changeEvent: MetricChangeEvent) {
    this._metricSelectionService.updateMetricSelection('Distribution', changeEvent);
  }

  public onFilterChanged(newFilter: entityFilter) {
    this._distributionService.changeFilter(newFilter);
  }

  public toggleExpanded() {
    this._distributionService.expandOrCollapse();
  }

}
