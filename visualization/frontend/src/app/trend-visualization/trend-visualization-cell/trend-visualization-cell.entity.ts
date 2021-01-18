import { ProjectEntity } from 'src/app/project/project.entity';
import { MetricSelection } from 'src/app/metric/metric.entity';
import { TrendVisualizationSeries } from '../trend-visualization-series.entity';
import { ReferenceLine } from 'src/app/health-indicator/health-indicator.entity';

export interface TrendVisualizationCellEntity {
    id: string;
    rowId: number;
    metrics: MetricSelection[];
    project: ProjectEntity;
    series: TrendVisualizationSeries[],
    referenceLines: ReferenceLine[];
}

export function trendVisualizationCellFactory(
    id: string,
    rowId: number,
    metrics: MetricSelection[],
    project: ProjectEntity): TrendVisualizationCellEntity {
    return {
        id, rowId, metrics, project, series: [], referenceLines: []
    };
}
