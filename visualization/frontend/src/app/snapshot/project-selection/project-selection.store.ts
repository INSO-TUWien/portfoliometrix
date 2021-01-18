import { ProjectSelectionEntity } from './project-selection.entity';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Injectable } from '@angular/core';

export interface ProjectSelectionState extends EntityState<ProjectSelectionEntity> {}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'ProjectSelection'})
export class ProjectSelectionStore extends EntityStore<ProjectSelectionState, ProjectSelectionEntity> {
    constructor() {
        super({});
    }
}
