import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PortfolioService } from '../portfolio.service';
import { PortfolioEntity } from '../portfolio.entity';
import { PortfolioQuery } from '../portfolio.query';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-portfolio-selection',
  templateUrl: './portfolio-selection.component.html',
  styleUrls: ['./portfolio-selection.component.css']
})
export class PortfolioSelectionComponent implements OnInit {

  portfolios$: Observable<PortfolioEntity[]>;
  activePortfolio$: Observable<PortfolioEntity>;

  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly portfolioQuery: PortfolioQuery) { }

  ngOnInit() {
    this.portfolioService.loadPortfolios();
    this.portfolios$ = this.portfolioQuery.portfolios$;
    this.activePortfolio$ = this.portfolioQuery.selectActive().pipe(filter(x => !!x));
  }

  public onPortfolioSelectionChange(portfolioKey: string): void {
    if (portfolioKey) {
      this.portfolioService.selectPortfolio(portfolioKey);
    }
  }
}
