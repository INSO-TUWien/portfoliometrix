import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { DistributionPerSnapshotEntity, entityFilter } from '../../distribution/distribution.entity';
import { SnapshotMetricSelectionService } from '../../snapshot-metric-selection/snapshot-metric-selection.service';
import { SnapshotMetricSelectionQuery } from '../../snapshot-metric-selection/snapshot-metric-selection.query';
import { CombinedSeriesTrendQuery } from '../../combined-series/combined-series-trend/combined-series-trend.query';
import { DistributionQuery } from '../../distribution/distribution.query';
import { DistributionService } from '../../distribution/distribution.service';
import { flatMap, filter, map } from 'rxjs/operators';
import { MetricChangeEvent } from 'src/app/metric/metric.entity';
import { ProjectArtifactEntity } from '../entity.entity';
import { ProjectArtifactQuery } from '../entity.query';
import { ProjectArtifactService } from '../entity.service';
import { ProjectSelectionQuery } from '../../project-selection/project-selection.query';
import { ProjectSnapshotQuery } from '../../project-snapshot/project-snapshot.query';
import { Snapshot } from '../../project-snapshot/projet-snapshot.entity';


@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityListComponent implements OnInit {

  public metricSelection$ = this._snapshotMetricSelectionQuery.selectionForEntityList$;
  public artifactListsForCurrentSnapshot$: Observable<ProjectArtifactEntity[]>;
  public entityFilter$ = this._artifactQuery.currentFilter$;
  public isMetricValid$ = this._artifactQuery.hasValidMetric$;
  public isExpanded$ = this._artifactQuery.isExpanded$;
  public selectedProjects$ = this._projectSelectionQuery.onlySelectedProjects$;
  public isLoading$: Observable<boolean>;
  public currentSnapshot$: Observable<Snapshot>;
  public tileWidth$: Observable<number>;
 
  constructor(
    private readonly _metricSelectionService: SnapshotMetricSelectionService,
    private readonly _snapshotMetricSelectionQuery: SnapshotMetricSelectionQuery,
    private readonly _projectSelectionQuery: ProjectSelectionQuery,
    private readonly _artifactQuery: ProjectArtifactQuery,
    private readonly _artifactService: ProjectArtifactService,
    public readonly  snapshotQuery: ProjectSnapshotQuery) { }

  ngOnInit() {
    this.artifactListsForCurrentSnapshot$ = this._artifactQuery.selectAll();
    this.isLoading$ = this._artifactQuery.selectLoading();
    this.tileWidth$ = this.snapshotQuery.projectTileWidth$;
  }

  public getArtifactsPerProject(projectId: string) {
    const result$ = this.artifactListsForCurrentSnapshot$.pipe(
      flatMap(artifacts => artifacts),
      filter(a => a.id === projectId),
      map(d => d.entities)
    );
    return result$;
}

  public onMetricSelectionChanged(changeEvent: MetricChangeEvent) {
    this._metricSelectionService.updateMetricSelection('EntityList', changeEvent);
  }

  public onFilterChanged(newFilter: entityFilter) {
    this._artifactService.changeFilter(newFilter);
  }

  public toggleExpanded() {
    this._artifactService.expandOrCollapse();
  }

  public getLinkForArtifact(htmlUrl: string, snapshotHash: string, fileName: string) {
    return `${htmlUrl}/blob/${snapshotHash}/${fileName}`;
  }
}
