import { QueryEntity } from '@datorama/akita';
import { DistributionState, DistributionStore } from './distribution.store';
import { DistributionPerSnapshotEntity } from './distribution.entity';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { map, throttleTime } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class DistributionQuery extends QueryEntity<DistributionState, DistributionPerSnapshotEntity> {
    constructor(store: DistributionStore) {
        super(store);
    }

    public hasValidMetric$ = this.select(x => x.hasValidMetric);
    public isExpanded$ = this.select(x => x.isExpanded);
    public currentFilter$ = this.select(x => x.filter);

    public selectDistributionForSnapshot(snapshotIndex: number): Observable<DistributionPerSnapshotEntity> {
        return this.selectEntity(snapshotIndex);
    }
}
