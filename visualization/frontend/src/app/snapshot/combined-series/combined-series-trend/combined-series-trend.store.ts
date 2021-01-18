import { CombinedTrendSeriesEntity } from './combined-series-trend.entity';
import { EntityState, StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { TrendVisualizationControl } from 'src/app/trend-visualization/trend-visualization-control/trend-visualization-control';
import { TrendSeriesRange } from 'src/app/trend-visualization/trend-visualization-series.entity';
import { ReferenceLine } from 'src/app/health-indicator/health-indicator.entity';

export interface CombinedTrendSeriesState extends EntityState<CombinedTrendSeriesEntity> {
    selectedSnapshotIndex?: number;
    visualizationControls: TrendVisualizationControl;
    range: TrendSeriesRange;
    referenceLines: ReferenceLine[];
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'CombinedTrendSeries' })
export class CombinedTrendSeriesStore extends EntityStore<CombinedTrendSeriesState, CombinedTrendSeriesEntity> {
    constructor() {
        super({
            selectedSnapshotIndex: 0,
            visualizationControls: new TrendVisualizationControl(
                'absolute', 'none', true, true, false, false, false, false),
            range: {min: undefined, max: undefined},
            referenceLines: []
        });
    }

    public selectSnapshotByIndex(index: number) {
        this.update(s => ({
            s,
            selectedSnapshotIndex: index
        }
        ));
    }

    public updateControls(controls: TrendVisualizationControl) {
        this.update(s => ({
            s,
            visualizationControls: controls
        }));
    }

    public updateRange(range: TrendSeriesRange) {
        this.update(s => ({
            s,
            range
        }));
    }

    public clearRange() {
        this.update(s => ({
            s,
            range: {min: undefined, max: undefined}
        }));
    }

    public updateReferenceLines(referenceLines: ReferenceLine[]) {
        this.update(s => ({
            s,
            referenceLines
        }))
    }
}
