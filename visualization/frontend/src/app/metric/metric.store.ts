import { EntityState, ActiveState, StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { MetricEntity } from './metric.entity';

export interface MetricState extends EntityState<MetricEntity> {}
@StoreConfig({name: 'Metric'})
@Injectable({providedIn: 'root'})
export class MetricStore extends EntityStore<MetricState, MetricEntity> {
    constructor() {
        super({});
    }
}
