import { Injectable } from "@angular/core";
import { QueryEntity } from '@datorama/akita';
import { ProjectSnapshotState, ProjectSnapshotStore } from './project-snapshot.store';
import { ProjectSnapshotEntity } from './projet-snapshot.entity';
import { CombinedSeriesTrendQuery } from '../combined-series/combined-series-trend/combined-series-trend.query';
import { map, flatMap, tap, switchMap, filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProjectSnapshotQuery extends QueryEntity<ProjectSnapshotState, ProjectSnapshotEntity> {
    constructor(
        store: ProjectSnapshotStore,
        private readonly _trendSeriesQuery: CombinedSeriesTrendQuery) {
        super(store);
    }

    public projectTileWidth$ = this.select(x => x.tileWidth);

    public currentSnapshotByProject$(projectId: string) {
        const snapshots$ = this._trendSeriesQuery.selectedSnapshotIndex$.pipe(
            filter(x => x !== undefined),
            switchMap(index => {
                return this.selectAll({ filterBy: x => x.id === projectId }).pipe(
                    flatMap(x => x),
                    map(x => {
                        return x.snapshots[index];
                    })
                );
            }));
        return snapshots$;
    }
}
