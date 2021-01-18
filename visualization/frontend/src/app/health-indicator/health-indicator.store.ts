import { EntityState, StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { HealthIndicatorEntity } from './health-indicator.entity';



export interface HealthIndicatorState extends EntityState<HealthIndicatorEntity> {
    portfolioIndicator: HealthIndicatorEntity; // portfolio indicator is stored globally
}

@StoreConfig({ name: 'HealthIndicator' })
@Injectable({ providedIn: 'root' })
export class HealthIndicatorStore extends EntityStore<HealthIndicatorState, HealthIndicatorEntity> {
    constructor() {
        super({});
    }

    public setHealthIndicators(healthIndicators: HealthIndicatorEntity[]) {
        // filter the one that is for the portfolio
        // (if there are more than one - which should not happen, take the first)
        const portfolioIndicators = healthIndicators.filter(x => x.targetType === 'Portfolio');
        if (portfolioIndicators.length > 0) {
            const portfolioIndicator = portfolioIndicators[0];
            this.update(state => ({
                ...state,
                portfolioIndicator
            }));
        }
        const projectIndicators = healthIndicators.filter(x => x.targetType === 'Project');
        this.set(projectIndicators);
    }

    public updateIndicator(healthIndicator: HealthIndicatorEntity) {
        if (healthIndicator.targetType === 'Portfolio') {
            this.update(state => ({
                ...state,
                portfolioIndicator: healthIndicator
            }));
        } else {
            this.upsert(healthIndicator.id, healthIndicator);
        }
    }
}


