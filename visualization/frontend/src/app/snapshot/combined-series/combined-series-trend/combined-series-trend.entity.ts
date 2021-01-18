
import { TrendVisualizationSeries } from 'src/app/trend-visualization/trend-visualization-series.entity';

/**
 * stores the same information as a trend series (which is used in the cell entity)
 * but has an additional ID so that the series can be stored in an EntityStore
 */
export interface CombinedTrendSeriesEntity extends TrendVisualizationSeries {
    id: string;
    project: string;
}
