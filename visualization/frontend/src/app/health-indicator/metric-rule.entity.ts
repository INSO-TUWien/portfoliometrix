import { MetricEntity } from '../metric/metric.entity';

export type aggregate = 'sum' | 'average' | 'median' | 'min' | 'max';

export interface MetricRuleEntity {
    id: string;
    metric: MetricEntity;
    lowerThreshold?: number;
    upperThreshold?: number;
    affectsHealth: boolean;
    aggregate: aggregate;
}
