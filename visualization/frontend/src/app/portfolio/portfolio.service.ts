import { Injectable } from '@angular/core';
import { ApiService } from '../provider/api.service';
import { flatMap, map, toArray } from 'rxjs/operators';
import { PortfolioStore } from './portfolio.store';
import { PortfolioDto, portfolioFactory } from './portfolio.entity';

@Injectable({providedIn: 'root'})
export class PortfolioService {

  constructor(
    private readonly store: PortfolioStore,
    private apiService: ApiService) {}

    public loadPortfolios(): void {
      this.apiService.get<PortfolioDto[]>('portfolios')
      .pipe(
        flatMap(item => item),
        map(item => portfolioFactory(item)),
        toArray())
      .subscribe(portfolios => {
        this.store.add(portfolios);
        this.store.activateFirst();
      });
    }

    public selectPortfolio(key: string) {
      this.store.setActive(key);
    }
}
