import { ProjectEntity } from '../project/project.entity';
import { MetricEntity } from '../metric/metric.entity';
import { MetricRuleEntity } from '../health-indicator/metric-rule.entity';
import { ProjectQuery } from '../project/project.query';
import { MetricQuery } from '../metric/metric.query';

export type HealthState = 'Critical' |'Worsening' | 'Improving' | 'Good' | 'NotCalculated';

export interface HealthStateDto {
    project: string;
    metric: string;
    state: HealthState;
    rule: string;
    affectsHealth: boolean;
}

export interface HealthStateEntity {
    id: number; // required for store
    project: ProjectEntity;
    metric: MetricEntity;
    state: HealthState;
    affectsHealth: boolean;
}

/** shows the current health state for the portfolio,
 * grouped by metric (the worst project state per metric is
 * calculated)
 */
export interface OverallHealthStateByMetric {
    metricId: string;
    message: string;
    state: HealthState;
}

export interface OverallHealthState {
    message: string;
    state: HealthState;
}

let healthStateIndex = 0;

export function convertHealthStateDtoToEntity(
    dto: HealthStateDto,
    projectQuery: ProjectQuery,
    metricQuery: MetricQuery,
    affectsHealth: boolean): HealthStateEntity {
        const project = projectQuery.getEntity(dto.project);
        const metric = metricQuery.getEntity(dto.metric);
        const result: HealthStateEntity = {
            id: healthStateIndex++,
            project,
            metric,
            state: dto.state,
            affectsHealth
        };
        return result;
    }
