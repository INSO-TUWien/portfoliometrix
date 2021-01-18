import { EntityState, ActiveState, StoreConfig, EntityStore } from '@datorama/akita';
import { Injectable } from '@angular/core';
import { PortfolioEntity } from './portfolio.entity';

export interface PortfolioState extends EntityState<PortfolioEntity>, ActiveState {}
@StoreConfig({name: 'Portfolio'})
@Injectable({providedIn: 'root'})
export class PortfolioStore extends EntityStore<PortfolioState, PortfolioEntity> {
    constructor() {
        super({});
    }
    
    public activateFirst() {
        const firstId = this.getValue().ids[0];
        this.setActive(firstId);
    }
}
