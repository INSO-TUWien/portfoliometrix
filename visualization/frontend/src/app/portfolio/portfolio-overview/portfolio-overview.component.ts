import { Component, OnInit, Input } from '@angular/core';
import { PortfolioQuery } from '../portfolio.query';
import { HealthIndicatorService } from 'src/app/health-indicator/health-indicator.service';
import { HealthIndicatorEntity } from 'src/app/health-indicator/health-indicator.entity';
import { filter, map } from 'rxjs/operators';
import { HealthStateService } from 'src/app/health-state/health-state.service';
import { PortfolioEntity } from '../portfolio.entity';
import { Observable } from 'rxjs';
import { HealthIndicatorQuery } from 'src/app/health-indicator/health-indicator.query';
import { ProjectEntity } from 'src/app/project/project.entity';
import { ProjectQuery } from 'src/app/project/project.query';

@Component({
  selector: 'app-portfolio-overview',
  templateUrl: './portfolio-overview.component.html',
  styleUrls: ['./portfolio-overview.component.scss']
})
export class PortfolioOverviewComponent implements OnInit {


  public activePortfolio$: Observable<PortfolioEntity>;
  public indicator$: Observable<HealthIndicatorEntity>;
  


  constructor(
    private readonly _indicatorQuery: HealthIndicatorQuery,
    private readonly _portfolioQuery: PortfolioQuery,
    private readonly _healthIndicatorService: HealthIndicatorService) {}

  ngOnInit() {
    this.indicator$ = this._indicatorQuery.portfolioIndicator$;
    this.activePortfolio$ = this._portfolioQuery.selectActive();

    this.activePortfolio$.pipe(
      filter(active => !!active),
      map(active => {
        return this._healthIndicatorService.loadIndicators(active.id);
      })
    ).subscribe(); // subscribe only to execute the query
  }

  public onIndicatorUpdated(healthIndicator: HealthIndicatorEntity) {
    this._healthIndicatorService.createOrUpdateIndicator(healthIndicator);
  }

}
