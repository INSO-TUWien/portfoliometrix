import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { ProjectState, ProjectStore, sorting } from './project.store';
import { ProjectEntity } from './project.entity';
import { HealthStateQuery, ProjectHealthStateQuery } from '../health-state/health-state.query';
import { combineLatest, of } from 'rxjs';
import { map, flatMap, toArray, take } from 'rxjs/operators';
import { HealthState, OverallHealthState } from '../health-state/health-state.entity';


interface ProjectByHealth {
    project: ProjectSortProperty;
    health: HealthState;
}

interface ProjectSortProperty {
    projectId: string;
    projectName: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectQuery extends QueryEntity<ProjectState, ProjectEntity> {
    constructor(
        protected readonly store: ProjectStore,
        private readonly _healthQuery: ProjectHealthStateQuery) { super(store); }

    public projectTileWidth$ = this.select(x => x.tileWidth);
    public sortOrder$ = this.select(x => x.sorting);

    public projects$ =
        combineLatest([
            this.selectAll(),
            this.sortOrder$
        ]).pipe(
            flatMap(([projects, order]) => {
                const sortedProjects = this.sortProjectsBySortOrder(order, projects.map(p => ({
                    projectName: p.name,
                    projectId: p.id,
                    project: p
                })));
                return sortedProjects.pipe(map(x => x.map(p => p.project)));
            })
        );

    private readonly HEALTH_STATE_NUMBER_DESC: Record<HealthState, number> = {
        Good: 0,
        Improving: 1,
        Worsening: 2,
        Critical: 3,
        NotCalculated: 4
    };

    private readonly HEALTH_STATE_NUMBER_ASC: Record<HealthState, number> = {
        Critical: 0,
        Worsening: 1,
        Improving: 2,
        Good: 3,
        NotCalculated: 4
    };

    // used by project list and by trend cells to sort cells by project depending on sort criteria
    public sortProjectsBySortOrder<T extends ProjectSortProperty>(sortOrder: sorting, projects: T[]) {
        if (sortOrder === 'name') {
            return of(projects.sort((a, b) => a.projectName < b.projectName ? -1 : 1));
        } else {
            const byHealth = this.projectsByHealthState(
                // always sort by name before, because sort operation is not stable
                projects.sort((a, b) => a.projectName < b.projectName ? -1 : 1),
                sortOrder === 'rate (asc)');
            return byHealth;
        }
    }

    private projectsByHealthState<T extends ProjectSortProperty>(projects: T[], isAscending: boolean) {
        return of(projects).pipe(
            flatMap(p => p),
            flatMap(project => {
                const projectByHealth = this._healthQuery.getWorstHealthStateForEntity(project.projectId).pipe(
                    map(health => ({ project, health: health.state }))
                );
                return projectByHealth;
            }),
            take(projects.length),
            toArray(),
            map(x => {
                return x
                    .sort((a, b) => isAscending ? this.sortByHealthAsc(a, b) : this.sortByHealthDesc(a, b))
                    .map(p => p.project);
            })
        );
    }

    private sortByHealthAsc(a: ProjectByHealth, b: ProjectByHealth): number {
        const numberA = this.HEALTH_STATE_NUMBER_ASC[a.health];
        const numberB = this.HEALTH_STATE_NUMBER_ASC[b.health];
        return numberA - numberB;
    }

    private sortByHealthDesc(a: ProjectByHealth, b: ProjectByHealth): number {
        const numberA = this.HEALTH_STATE_NUMBER_DESC[a.health];
        const numberB = this.HEALTH_STATE_NUMBER_DESC[b.health];
        return numberA - numberB;
    }
}
