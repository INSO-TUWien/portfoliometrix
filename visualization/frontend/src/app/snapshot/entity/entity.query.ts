import { QueryEntity } from "@datorama/akita"
import { ProjectArtifactEntityState, ProjectArtifactEntityStore } from './entity.store';
import { ProjectArtifactEntity } from './entity.entity';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ProjectArtifactQuery extends QueryEntity<ProjectArtifactEntityState, ProjectArtifactEntity> {
    constructor(store: ProjectArtifactEntityStore) {
        super(store);
    }

    public hasValidMetric$ = this.select(x => x.hasValidMetric);
    public isExpanded$ = this.select(x => x.isExpanded);
    public currentFilter$ = this.select(x => x.filter);
}
