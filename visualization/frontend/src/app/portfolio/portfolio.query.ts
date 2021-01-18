import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { PortfolioState, PortfolioStore } from './portfolio.store';
import { PortfolioEntity } from './portfolio.entity';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PortfolioQuery extends QueryEntity<PortfolioState, PortfolioEntity> {
    constructor(protected readonly store: PortfolioStore) { super(store); }
    public portfolios$ = this.selectAll();

    public firstPortfolio$ = this.selectFirst().pipe(filter(x => !!x));
    public getFirst(): PortfolioEntity {
        return this.getAll()[0];
    }
}
