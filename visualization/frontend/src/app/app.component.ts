import { Component, OnInit } from '@angular/core';
import { MetricService } from './metric/metric.service';
import { PortfolioQuery } from './portfolio/portfolio.query';
import { ProjectService } from './project/project.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public selectedPortfolio$ = this._portfolioQuery.selectActive();
  public dashboardIsActive = true;

  constructor(
    private readonly _metricService: MetricService,
    private readonly _portfolioQuery: PortfolioQuery,
    private readonly _projectService: ProjectService
    ) {}

  ngOnInit(): void {
    this._metricService.loadMetrics();
    this._projectService.loadProjects();
  }
}
