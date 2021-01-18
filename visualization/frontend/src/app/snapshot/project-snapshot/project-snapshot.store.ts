import { ProjectSnapshotEntity } from './projet-snapshot.entity';
import { EntityState, StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';

export interface ProjectSnapshotState extends EntityState<ProjectSnapshotEntity> {
    tileWidth: number;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'ProjectSnapshot'})
export class ProjectSnapshotStore extends EntityStore<ProjectSnapshotState, ProjectSnapshotEntity> {
    constructor() {
        super({
            tileWidth: 100 // just a dummy value
        });
    }

    updateTileWidth(newWidth: number) {
        this.update(state => ({
            ...state,
            tileWidth: newWidth
        }));
    }
}
