import { ProjectEntity } from './project.entity';
import { EntityState, StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';

export type sorting = 'name'|'rate (asc)'|'rate (desc)';

export interface ProjectState extends EntityState<ProjectEntity> {
    tileWidth: number;
    sorting: sorting;
}
@StoreConfig({name: 'Project'})
@Injectable({providedIn: 'root'})
export class ProjectStore extends EntityStore<ProjectState, ProjectEntity> {
    constructor() {
        super({
            tileWidth: 100, // just a dummy value,
            sorting: 'name'
        });
    }

    updateTileWidth(newWidth: number) {
        this.update(state => ({
            ...state,
            tileWidth: newWidth
        }));
    }

    updateSorting(newSortingCriteria: sorting) {
        this.update(state => ({
            ...state,
            sorting: newSortingCriteria
        }));
    }
}
