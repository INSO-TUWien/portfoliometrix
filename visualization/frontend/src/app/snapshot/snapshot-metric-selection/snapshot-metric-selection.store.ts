import { Injectable } from '@angular/core';
import { StoreConfig, EntityStore, EntityState, arrayUpdate } from '@datorama/akita';
import { SnapshotMetricSelectionEntity, SnapshotDiagramType } from './snapshot-metric-selection.entity';
import { MetricChangeEvent } from 'src/app/metric/metric.entity';

export interface SnapshotMetricSelectionState extends EntityState<SnapshotMetricSelectionEntity, SnapshotDiagramType> { }

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'SnapshotMetric' })
export class SnapshotMetricSelectionStore extends EntityStore<SnapshotMetricSelectionState, SnapshotMetricSelectionEntity> {
    constructor() {
        super({});
    }

    public updateMetricSelection(type: SnapshotDiagramType, change: MetricChangeEvent) {
        this.update(type, entity => {
            // handle single selections
            if (entity.isSingleSelection && change.isSelected) {
                const newSelection = entity.selection.map(x => ({
                    id: x.id,
                    name: x.name,
                    isSelected: x.id === change.id
                }));
                const newSingleSelectionState = {
                    // TODO: check if this update works
                    selection: newSelection
                };
                return newSingleSelectionState;
            }
            const newState = {
                selection: arrayUpdate(entity.selection, change.id, { isSelected: change.isSelected })
            };
            return newState;
        });
    }
}
