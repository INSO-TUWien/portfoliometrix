import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/provider/api.service';
import { CombinedSeriesTrendQuery } from '../combined-series/combined-series-trend/combined-series-trend.query';
import { switchMap, filter, map, flatMap, throttleTime } from 'rxjs/operators';
import { ProjectEntityDto, ProjectArtifactEntity } from './entity.entity';
import { ProjectQuery } from 'src/app/project/project.query';
import { SnapshotMetricSelectionQuery } from '../snapshot-metric-selection/snapshot-metric-selection.query';
import { combineLatest, Observable, of } from 'rxjs';
import { ProjectArtifactEntityStore } from './entity.store';
import { ProjectArtifactQuery } from './entity.query';
import { entityFilter } from '../distribution/distribution.entity';

@Injectable({ providedIn: 'root' })
export class ProjectArtifactService {
  constructor(
    private readonly _apiService: ApiService,
    private readonly _combinedTrendQuery: CombinedSeriesTrendQuery,
    private readonly _metricQuery: SnapshotMetricSelectionQuery,
    private readonly _projectQuery: ProjectQuery,
    private readonly _entityQuery: ProjectArtifactQuery,
    private readonly _store: ProjectArtifactEntityStore) {

    const result$ = combineLatest([
      this._combinedTrendQuery.selectedSnapshotIndex$.pipe(
        filter(x => x !== undefined)
      ),
      this._metricQuery.selectionForEntityList$.pipe(
        filter(x => x !== undefined),
        map(x => x.selection.filter(m => m.isSelected).map(y => y.id))
      ),
      this._entityQuery.currentFilter$,
      // TODO: use only selected projects here
      this._projectQuery.selectAll().pipe(
        filter(x => x.length > 0)
      )
    ]).pipe(
      throttleTime(3000),
      // switchmap should cancel request when outer observable changes
      switchMap(([snapshot, metrics, filter, _]) => {
        const projectIds = this._projectQuery.getAll().map(x => x.id);
        // if no metrics defined, return empty entity lists per project
        if (metrics.length === 0) {
          const emptyResult = projectIds.map(p => ({
            id: p,
            entities: []
          } as ProjectArtifactEntity)
          );
          return of(emptyResult);
        }
        this._store.setLoading(true);
        const networkResult$ = this._apiService.get<ProjectEntityDto[]>('artifacts', {
          snapshot: (snapshot + 1).toString(), // snapshots start with 1 in DB
          projects: projectIds,
          metric: metrics[0], // there can always be only one active metric
          filter
        }).pipe(
          map(dtos => {
            return dtos.map(dto => ({
              id: dto.project,
              entities: dto.entities
            } as ProjectArtifactEntity));
          })
        );
        return networkResult$;
      })
    );
    result$.subscribe(projectEntities => {
      this._store.set(projectEntities);
      this._store.updateValidMetric(projectEntities.length > 0);
      this._store.setLoading(false);
    });
  }

  public changeFilter(newFilter: entityFilter) {
    this._store.updateFilter(newFilter);
  }

  public expandOrCollapse() {
    const isExpanded = this._entityQuery.getValue().isExpanded;
    this._store.expandOrCollapse(!isExpanded);
  }
}
