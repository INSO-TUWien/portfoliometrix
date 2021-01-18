import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, pipe } from 'rxjs';
import { ProjectEntity } from 'src/app/project/project.entity';
import { ProjectService } from 'src/app/project/project.service';
import { ProjectSnapshotService } from '../project-snapshot.service';
import { ProjectSnapshotQuery } from '../project-snapshot.query';
import { flatMap, filter } from 'rxjs/operators';
import { ProjectQuery } from 'src/app/project/project.query';
import { ProjectSelectionEntity, ProjectChangeEvent } from '../../project-selection/project-selection.entity';
import { ProjectSelectionQuery } from '../../project-selection/project-selection.query';
import { ProjectSelectionService } from '../../project-selection/project-selection.service';
import { ResizedEvent } from 'angular-resize-event';
import { SnapshotHealthService } from '../project-snapshot-health/project-snapshot.health.service';
import { ProjectSnapshotHealthQuery } from '../project-snapshot-health/project-snapshot-health.query';
import { ProjectHealth } from '../project-snapshot-health/project-snapshot-health.entity';
import arrayToSentence from 'array-to-sentence';
import { MetricQuery } from 'src/app/metric/metric.query';

@Component({
  selector: 'app-project-snapshot-list',
  templateUrl: './project-snapshot-list.component.html',
  styleUrls: ['./project-snapshot-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectSnapshotListComponent implements OnInit {

  public projects$: Observable<ProjectSelectionEntity[]>;
  public selectedProjects$: Observable<ProjectSelectionEntity[]>;

  constructor(
    private readonly _projectSelectionQuery: ProjectSelectionQuery,
    private readonly _projectSnapshotService: ProjectSnapshotService,
    private readonly _projectSelectionService: ProjectSelectionService,
    public readonly snapshotQuery: ProjectSnapshotQuery,
    private readonly _snapshotHealthService: SnapshotHealthService,
    public readonly healthQuery: ProjectSnapshotHealthQuery,
    private readonly _metricQuery: MetricQuery) { }

  ngOnInit() {

    this.projects$ = this._projectSelectionQuery.projectSelections$;
    this.selectedProjects$ = this._projectSelectionQuery.onlySelectedProjects$;
    // create selections
    this._projectSelectionService.loadProjectSelections();
    // load snapshots for selected projects
    this.projects$.subscribe(projects => {
      this._projectSnapshotService.clearSnapshots();
      projects.filter(x => x.isSelected).forEach(project => {
        this._projectSnapshotService.loadSnapshotsForProject(project.id);
      });
    });

    this._snapshotHealthService.start();
  }

  public onProjectSelectionChanged(changeEvent: ProjectChangeEvent) {
    this._projectSelectionService.changeSelection(changeEvent.id, changeEvent.isSelected);
  }

  onProjectTileResized(resizeEvent: ResizedEvent) {
    if (resizeEvent.newWidth !== resizeEvent.oldWidth) {
      this._projectSnapshotService.updateTileWidth(resizeEvent.newWidth);
    }
  }

  public getViolations(healthState: ProjectHealth): string {
    return healthState.violations.length > 0 ? 
      `Violations: ${arrayToSentence(healthState.violations.map(x => this._metricQuery.getEntity(x).name))}` : '';
  }

  public createCommitUrl(htmlUrl: string, commit: string) {
    return `${htmlUrl}/commit/${commit}`;
  }
}
