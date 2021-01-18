import { Injectable } from '@angular/core';
import { CombinedTrendSeriesState, CombinedTrendSeriesStore } from './combined-series-trend.store';
import { CombinedTrendSeriesEntity } from './combined-series-trend.entity';
import { QueryEntity } from '@datorama/akita';
import { map } from 'rxjs/operators';
import { MetricQuery } from 'src/app/metric/metric.query';
import * as color from 'color';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CombinedSeriesTrendQuery extends QueryEntity<CombinedTrendSeriesState, CombinedTrendSeriesEntity> {
    constructor(
        private metricQuery: MetricQuery,
        store: CombinedTrendSeriesStore) {
        super(store);
    }

    public selectedSnapshotIndex$ = this.select(state => state.selectedSnapshotIndex);
    public visualizationControls$ = this.select(state => state.visualizationControls);
    public range$ = this.select(state => state.range);

    public colorPalette$ = this.selectAll().pipe(
        map(series => {
            // stores how often a metric appears in the series
            // for every appearance, the color will be changed
            const colorMap: {name: string, value: string}[] = [];
            const metricCount = new Map<string, number>();
            series.forEach(s => {
                if (metricCount.get(s.metric)) {
                    metricCount.set(s.metric, metricCount.get(s.metric) + 1);
                } else {
                    metricCount.set(s.metric, 1);
                }
                const seriesColor = color(this.metricQuery.colorMap[s.metric])
                    .hsl().lighten(0.2 * metricCount.get(s.metric))
                    .toString();
                colorMap.push({name: s.name, value: seriesColor});
            });
            return colorMap;
        })
    );

    public getSelectedSnapshotIndex(): number {
        return this.getValue().selectedSnapshotIndex;
    }

    public referenceLines$ = this.select(state => state.referenceLines);
}
