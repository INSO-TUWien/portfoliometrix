import { EntityState, StoreConfig, EntityStore, arrayUpdate } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { TrendVisualizationRowEntity } from './trend-visualization-row.entity';
import { TrendVisualizationControl } from '../trend-visualization-control/trend-visualization-control';
import { SLOC } from 'src/app/metric/metric.entity';

export interface TrendVisualizationRowState extends EntityState<TrendVisualizationRowEntity> {
}
@StoreConfig({ name: 'TrendVisualizationRow' })
@Injectable({ providedIn: 'root' })
export class TrendVisualizationRowStore extends EntityStore<TrendVisualizationRowState, TrendVisualizationRowEntity> {
    constructor() {
        super({});
    }

    public updateRange(rowId: number, min: number, max: number) {
        this.update(rowId, ({
            range: {
                min,
                max
            }
        }));
    }

    public clearRange(rowId) {
        this.update(rowId, ({
            range: {
                min: undefined,
                max: undefined
            }
        }));
    }

    public changeMetricSelection(rowId: number, metricId: string, isSelected: boolean) {
        this.update(rowId, entity => {
            // create a temp copy of the new metric state
            const metricSelections = entity.metrics.map(x => ({
                id: x.id,
                isSelected: x.isSelected,
                name: x.name
            }));
            metricSelections.filter(x => x.id === metricId).forEach(x => x.isSelected = isSelected);
            const controls = entity.controls.updateByMetrics(metricSelections);
            return ({
                metrics: arrayUpdate(entity.metrics, metricId, { isSelected }),
                controls
            });

            // // SLOC is deactivated, so switch to median
            // const controls = entity.controls.clone();
            // if (metricId === SLOC) {
            //     if (!isSelected) {
            //         // SLOC removed, so no other "Sum" metrics
            //         controls.canHaveSum = false;
            //         controls.showSum = false;
            //         if (controls.aggregate === 'none') {
            //             controls.aggregate = 'median';
            //         }
            //     } else {
            //         // SLOC was selected, check if there are
            //         // also other metrics
            //         controls.canHaveSum = true;
            //         controls.showSum = true;
            //         if (entity.metrics.filter(x => x.isSelected).length > 0) {
            //             if (controls.aggregate === 'none') {
            //                 controls.aggregate = 'median';
            //             }
            //         } else {
            //             controls.aggregate = 'none';
            //         }
            //     }
            // } else {
            //     // SLOC was already active, check if another metric is also active
            //     if (entity.metrics.filter(x => x.isSelected && x.id === SLOC)) {
            //        if (isSelected) {
            //            if (controls.aggregate === 'none') {
            //                controls.aggregate = 'median';
            //            }
            //        } else {
            //            if (entity.metrics.length === 1) { // only SLOC active
            //                 controls.aggregate = 'none';
            //            }
            //        }
            //     }
            // }

        });
    }

    public changeControls(rowId: number, controls: TrendVisualizationControl) {
        this.update(rowId, _ => ({
            controls
        }));
    }
}


