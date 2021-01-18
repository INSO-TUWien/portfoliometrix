import { QueryEntity } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { SnapshotHealthEntity, ProjectHealth } from './project-snapshot-health.entity';
import { SnapshotHealthState, SnapshotHealthStore } from './project-snapshot-health.store';
import { Observable } from 'rxjs';
import { map, flatMap, filter } from 'rxjs/operators';
import { HealthState } from 'src/app/health-state/health-state.entity';

@Injectable({providedIn: 'root'})
export class ProjectSnapshotHealthQuery extends QueryEntity<SnapshotHealthState, SnapshotHealthEntity> {
    constructor(store: SnapshotHealthStore) {
        super(store);
    }

    public selectHealthBySnapshot(index: number, projectId: string): Observable<ProjectHealth> {
        return this.selectEntity(index).pipe(
            filter(x => x !== undefined),
            map(x => x.projectHealthStates),
            flatMap(p => p),
            filter(p => p.projectId === projectId)
        );
    }

    public selectHealthStateBySnapshot(index: number, projectId: string): Observable<string> {
        return this.selectEntity(index).pipe(
            map(x => {
                if (x === undefined) {
                    return 'NotCalculated';
                }
                const healthStatesByProject = x.projectHealthStates.filter(p => p.projectId === projectId);
                if (healthStatesByProject.length === 0) {
                    return 'NotCalculated';
                } else {
                    return healthStatesByProject[0].health;
                }
            })
        );
    }
}
