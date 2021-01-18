import { MetricSelection } from '../../metric/metric.entity';

export type SnapshotDiagramType = 'CombinedSeries' | 'Distribution' | 'PolarChart' | 'EntityList';

/** stores the selection of metrics for a specific type of visualization */
export interface SnapshotMetricSelectionEntity {
    id: SnapshotDiagramType;
    isSingleSelection: boolean;
    selection: MetricSelection[];
};
