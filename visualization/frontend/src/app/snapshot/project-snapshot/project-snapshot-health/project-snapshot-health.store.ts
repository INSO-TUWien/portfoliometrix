import { SnapshotHealthEntity } from './project-snapshot-health.entity';
import { EntityState, StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';

export interface SnapshotHealthState extends EntityState<SnapshotHealthEntity> {}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'SnapshotHealth'})
export class SnapshotHealthStore extends EntityStore<SnapshotHealthState, SnapshotHealthEntity> {
    constructor() {
        super({});
    }
}
