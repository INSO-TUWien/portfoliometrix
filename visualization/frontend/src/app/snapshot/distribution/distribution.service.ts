import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/provider/api.service';
import { entityFilter, DistributionPerSnapshotEntity, DistributionDto } from './distribution.entity';
import { SnapshotMetricSelectionQuery } from '../snapshot-metric-selection/snapshot-metric-selection.query';
import { DistributionQuery } from './distribution.query';
import { combineLatest, of, Observable } from 'rxjs';
import { ProjectQuery } from 'src/app/project/project.query';
import { filter, flatMap, map } from 'rxjs/operators';
import { DistributionStore } from './distribution.store';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {

  constructor(
    private readonly _apiService: ApiService,
    private readonly _metricSelectionQuery: SnapshotMetricSelectionQuery,
    private readonly _distributionQuery: DistributionQuery,
    private readonly _projectQuery: ProjectQuery,
    private readonly _store: DistributionStore) {

    combineLatest([
      _metricSelectionQuery.selectionForDistribution$,
      _projectQuery.selectAll(),
      _distributionQuery.currentFilter$
    ]).pipe(
      filter(tuple => tuple[1].length > 0),
      filter(tuple => tuple[2] !== undefined),
      flatMap(tuple => {
        const projects = tuple[1].map(x => x.id);
        const metrics = tuple[0].selection
          .filter(x => x.isSelected)
          .map(x => x.id);
        const filter = tuple[2];
        if (metrics.length === 0) {
          return of([]);
        }
        return this.loadDistributions(projects, filter, metrics[0]);
      })
    ).subscribe(
      distributions => {
        this._store.set(distributions);
        this._store.updateValidMetric(distributions.length > 0);
      }
    );
  }

  public loadDistributions(projectIds: string[], filter: entityFilter, metricId: string): Observable<DistributionPerSnapshotEntity[]> {
    return this._apiService.get<DistributionDto[]>('distributions', {
      projects: projectIds,
      filter,
      metric: metricId
    }).pipe(
      map(dtos => {
        const distributions: DistributionPerSnapshotEntity[] = dtos.map(dto => ({
          id: dto.snapshot - 1, // index in frontend starts with 0
          metric: metricId,
          distributionsPerProject: dto.projects.map(x => ({
              project: x.id,
              series: x.values.map(v => ({name: v.name, value: v.value}))
          }))
        }));
        return distributions;
      })
    );
  }

  public changeFilter(newFilter: entityFilter) {
    this._store.updateFilter(newFilter);
  }

  public expandOrCollapse() {
    const isExpanded = this._distributionQuery.getValue().isExpanded;
    this._store.expandOrCollapse(!isExpanded);
  }
}
