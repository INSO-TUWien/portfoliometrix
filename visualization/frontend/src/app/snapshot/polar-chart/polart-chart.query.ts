import { QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PolarChartDataState, PolarChartDataStore } from './polar-chart.store';
import { PolarChartDataPerSnapshotEntity } from './polar-chart.entity';

@Injectable({providedIn: 'root'})
export class PolarChartDataQuery extends QueryEntity<PolarChartDataState, PolarChartDataPerSnapshotEntity> {
    constructor(store: PolarChartDataStore) {
        super(store);
    }

    public hasValidMetric$ = this.select(x => x.hasValidMetric);
    public isExpanded$ = this.select(x => x.isExpanded);

    public selectPolarChartDataForSnapshot(snapshotIndex: number): Observable<PolarChartDataPerSnapshotEntity> {
        return this.selectEntity(snapshotIndex);
    }
}
