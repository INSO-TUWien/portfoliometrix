import { Injectable } from '@angular/core';
import { ApiService } from '../provider/api.service';
import { ProjectStore, sorting } from './project.store';
import { flatMap, map, filter } from 'rxjs/operators';
import { PortfolioQuery } from '../portfolio/portfolio.query';
import { ProjectDto, projectFactory } from './project.entity';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  
  constructor(
    private readonly _store: ProjectStore,
    private readonly _portfolioQuery: PortfolioQuery,
    private readonly apiService: ApiService) {}

    public loadProjects() {
      const loadProjects$ =
        this._portfolioQuery.selectActive().pipe(
          filter(portfolio => !!portfolio),
          flatMap(portfolio => {
            return this.apiService.get<ProjectDto[]>(`projects/${portfolio.id}`);
          }),
          map(dtos => dtos.map(dto => projectFactory(dto)))
      );
      loadProjects$.subscribe(projects => {
        this._store.add(projects.sort((a,b) => parseInt(a.id) - parseInt(b.id)));
      });
    }

    public updateTileWidth(newWidth: number) {
      this._store.updateTileWidth(newWidth);
    }

    public updateSortOrder(newOrder: sorting) {
      this._store.updateSorting(newOrder);
    }
}
