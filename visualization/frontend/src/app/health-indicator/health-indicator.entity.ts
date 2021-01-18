import { MetricRuleEntity, aggregate } from './metric-rule.entity';
import { MetricQuery } from '../metric/metric.query';
import { ProjectEntity } from '../project/project.entity';

/**
 * 1. There is only one health indicator for the portfolio
 * 2. All health indicators have the same class, the one for the portfolio
 *      has an additional flag
 * 3. A store is used to return a health indicator for a given project
 * 4. If the store does not contain a specific health indicator for a project,
 *      it returns the portfolio indicator
 */

export type indicatorTarget = 'Project' | 'Portfolio';

export interface HealthIndicatorDto {
    id: string;
    name: string;
    targetId: string; // to which entity (project, portfolio) belongs this indicator?
    targetType: indicatorTarget;
    rules: {
        id: string,
        metricId: string,
        lowerThreshold: number,
        upperThreshold: number,
        affectsHealth: boolean,
        aggregate: string
    }[];
}

export interface HealthIndicatorEntity {
    id: string;
    name: string;
    targetId: string; // either portfolio or project
    targetType: indicatorTarget;
    rules: MetricRuleEntity[];
}

export function getReferenceLinesForIndicator(
    indicator: HealthIndicatorEntity, 
    metrics: string[]): ReferenceLine[] {
        
    const referenceLines: ReferenceLine[] = [];
    indicator.rules.forEach(rule => {
        metrics.forEach(metric => {
            if (rule.metric.id === metric) {
                if (rule.lowerThreshold) {
                    referenceLines.push({ name: `${rule.metric.name} - lower bound`, value: rule.lowerThreshold });
                }
                if (rule.upperThreshold) {
                    referenceLines.push({ name: `${rule.metric.name} - upper bound`, value: rule.upperThreshold });
                }
            }
        });
    });
    return referenceLines;
}

export function getReferenceLinesForIndicatorWithProjectName(
    indicator: HealthIndicatorEntity, 
    metrics: string[],
    projectName: string): ReferenceLine[] {
        
    const referenceLines: ReferenceLine[] = [];
    indicator.rules.forEach(rule => {
        metrics.forEach(metric => {
            if (rule.metric.id === metric) {
                if (rule.lowerThreshold) {
                    referenceLines.push({ name: `${projectName} - ${rule.metric.name} - lower bound`, value: rule.lowerThreshold });
                }
                if (rule.upperThreshold) {
                    referenceLines.push({ name: `${projectName} - ${rule.metric.name} - upper bound`, value: rule.upperThreshold });
                }
            }
        });
    });
    return referenceLines;
}

export function healthIndicatorToDto(
    healthIndicator: HealthIndicatorEntity): HealthIndicatorDto {
    return {
        id: healthIndicator.id,
        name: healthIndicator.name,
        targetId: healthIndicator.targetId,
        targetType: healthIndicator.targetType,
        rules: healthIndicator.rules
            .map(rule => ({
                id: rule.id,
                metricId: rule.metric.id,
                lowerThreshold: rule.lowerThreshold,
                upperThreshold: rule.upperThreshold,
                affectsHealth: rule.affectsHealth,
                aggregate: rule.aggregate
            }))
    };
}

export function dtoToHealthIndicator(dto: HealthIndicatorDto, metricQuery: MetricQuery): HealthIndicatorEntity {
    const indicator: HealthIndicatorEntity = {
        id: dto.id,
        name: dto.name,
        targetId: dto.targetId,
        targetType: dto.targetType,
        rules: dto.rules.map(rule => ({
            id: rule.id,
            lowerThreshold: rule.lowerThreshold,
            upperThreshold: rule.upperThreshold,
            aggregate: rule.aggregate as aggregate,
            affectsHealth: rule.affectsHealth,
            metric: metricQuery.getEntity(rule.metricId)
        }))
    };
    return indicator;
}

export interface ReferenceLine {
    name: string;
    value: number;
}

