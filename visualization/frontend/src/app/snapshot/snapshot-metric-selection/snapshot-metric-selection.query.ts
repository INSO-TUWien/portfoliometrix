import { SnapshotMetricSelectionState, SnapshotMetricSelectionStore } from './snapshot-metric-selection.store';
import { SnapshotMetricSelectionEntity } from './snapshot-metric-selection.entity';
import { QueryEntity } from '@datorama/akita';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class SnapshotMetricSelectionQuery extends QueryEntity<SnapshotMetricSelectionState, SnapshotMetricSelectionEntity> {
    constructor(store: SnapshotMetricSelectionStore) {
        super(store);
    }

    public selectionForCombinedSeries$ = this.selectEntity('CombinedSeries');
    public selectionForDistribution$ = this.selectEntity('Distribution');
    public selectionForEntityList$ = this.selectEntity('EntityList');
    public selectionForPolarChart$ = this.selectEntity('PolarChart');
}
