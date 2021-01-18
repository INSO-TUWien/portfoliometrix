import { MetricSelection, MetricEntity } from '../../metric/metric.entity';
import { TrendVisualizationControl, trendVisualizationControlFactory, defaultTrendVisualizationControlFactory } from '../trend-visualization-control/trend-visualization-control';
import { TrendSeriesRange } from '../trend-visualization-series.entity';

/**
 * every row shows trend graphics for all projects and
 * for the selected metrics.
 * So every row contains a list of metrics where
 * one metric is selected in the beginning
 */
export interface TrendVisualizationRowEntity {
    id: number; // every entity needs an id to uniquely identify it in the store
    metrics: MetricSelection[];
    controls: TrendVisualizationControl;
    range: TrendSeriesRange;
}

/** creates a list of rows from the given metrics.
 * Every row contains a list of metrics where only one metric is selected.
 * The first row has the first metric selected, the second one the second metric etc...
 * Example: If there are two metrics: SLOC and RATIO, the resulting rows will look like this:
 * ROW 1:
 *      SLOC: true
 *      RATIO: false
 * ROW 2:
 *      SLOC: false
 *      RATIO: true
 */
export function trendVisualizationRowFactory(metrics: MetricEntity[]): TrendVisualizationRowEntity[] {
    const rows = metrics.map(m1 => ({
        id: -1,
        metrics: metrics.map(m2 => ({ ...m2, isSelected: m1 === m2 })),
        controls: defaultTrendVisualizationControlFactory(),
        range: {min: undefined, max: undefined}
    }));
    rows.forEach((value, index) => {
        value.id = index;
        value.controls = trendVisualizationControlFactory(value.metrics);
    });

    return rows;
}
