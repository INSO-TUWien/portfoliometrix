import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { DistributionPerSnapshotEntity, entityFilter } from './distribution.entity';

export interface DistributionState extends EntityState<DistributionPerSnapshotEntity>{
    filter: entityFilter;
    hasValidMetric: boolean;
    isExpanded: boolean;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'Distribution'})
export class DistributionStore extends EntityStore<DistributionState, DistributionPerSnapshotEntity> {
    constructor() {
        super({
            filter: 'file',
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
