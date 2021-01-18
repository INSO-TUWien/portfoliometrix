import { MetricQuery } from '../../metric/metric.query';
import { SnapshotDiagramType, SnapshotMetricSelectionEntity } from './snapshot-metric-selection.entity';
import { SnapshotMetricSelectionStore } from './snapshot-metric-selection.store';
import { MetricChangeEvent } from 'src/app/metric/metric.entity';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SnapshotMetricSelectionService {
    constructor(
        private readonly _metricQuery: MetricQuery,
        private readonly _store: SnapshotMetricSelectionStore) {
        this._metricQuery.selectAll().pipe(filter(x => x.length > 0)).subscribe(
            metrics => {
                // diagram types and amount of metrics that should be preselected
                const types: [SnapshotDiagramType, number, boolean][] = [
                    ['CombinedSeries', 1, false],
                    ['Distribution', 1, true],
                    ['EntityList', 1, true],
                    ['PolarChart', 3, false]
                ];
                const metricSelections = types.map(type => {
                    const metricSelection: SnapshotMetricSelectionEntity = {
                        id: type[0],
                        isSingleSelection: type[2],
                        selection: metrics.map(m => ({ ...m, isSelected: false }))
                    };
                    // preselect n elements
                    metricSelection.selection.forEach((s, index) => {
                        if (index < type[1]) {
                            s.isSelected = true;
                        }
                    });
                    return metricSelection;
                });
                this._store.set(metricSelections);
            }
        );
    }

    public updateMetricSelection(diagram: SnapshotDiagramType, changeEvent: MetricChangeEvent) {
        this._store.updateMetricSelection(diagram, changeEvent);
    }
}
