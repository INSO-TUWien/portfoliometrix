import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { HealthStateEntity } from './health-state.entity';
import { Injectable } from '@angular/core';

export interface HealthStateState extends EntityState<HealthStateEntity> {
    /** flag controls whether the portfolio state has already been calculated */
    isCalculated: boolean;
}

@StoreConfig({name: 'HealthState'})
@Injectable({providedIn: 'root'})
export class HealthStateStore extends EntityStore<HealthStateState, HealthStateEntity> {
    constructor() {
        super({});
    }

    public setHealthStates(states: HealthStateEntity[]) {
        this.update({
            isCalculated: true
        });
        this.set(states);
    }

    public updateHealthStatesForProject(projectId: string, entities: HealthStateEntity[]) {
        // remove all health states which are related to the given project id
        this.remove((entity: HealthStateEntity) => entity.project.id === projectId);
        // readd the new health states for the project
        this.add(entities);
    }
}
