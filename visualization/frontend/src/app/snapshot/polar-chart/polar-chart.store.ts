import { Injectable } from "@angular/core";
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { PolarChartDataPerSnapshotEntity } from './polar-chart.entity';

export interface PolarChartDataState extends EntityState<PolarChartDataPerSnapshotEntity> {
    hasValidMetric: boolean;
    isExpanded: boolean;
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'PolarChart'})
export class PolarChartDataStore extends EntityStore<PolarChartDataState, PolarChartDataPerSnapshotEntity> {
    constructor() {
        super({
            isExpanded: true
        });
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
