import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { entityFilter } from '../distribution/distribution.entity';
import { Injectable } from '@angular/core';
import { ProjectArtifactEntity } from './entity.entity';

export interface ProjectArtifactEntityState extends EntityState<ProjectArtifactEntity>{
    filter: entityFilter;
    hasValidMetric: boolean;
    isExpanded: boolean;
}

/** the store keeps only entities for a specific snapshot and metric,
 * whenever the snapshot, filter or metric is changed, all entities will be reloaded
 * again (otherwise the frontend would have to keep too much data in memory)
 */
@Injectable({providedIn: 'root'})
@StoreConfig({name: 'ProjectEntity'})
export class ProjectArtifactEntityStore extends EntityStore<ProjectArtifactEntityState, ProjectArtifactEntity> {
    constructor() {
        super({
            filter: 'class',
            isExpanded: true
        });
    }

    public updateFilter(newFilter: entityFilter) {
        this.update(s => ({
            ...s,
            filter: newFilter
        }));
    }

    updateValidMetric(isValid: boolean) {
        this.update(s => ({
            ...s,
            hasValidMetric: isValid
        }));
    }

    expandOrCollapse(isExpanded: boolean) {
        this.update(s => ({
            ...s,
            isExpanded
        }));
    }
}
