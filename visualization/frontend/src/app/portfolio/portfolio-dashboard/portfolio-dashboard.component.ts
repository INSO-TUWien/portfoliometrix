import { Component, OnInit, Input } from '@angular/core';
import { PortfolioEntity } from '../portfolio.entity';
import { PortfolioQuery } from '../portfolio.query';
import { Observable } from 'rxjs';
import { ProjectEntity } from 'src/app/project/project.entity';
import { ProjectQuery } from 'src/app/project/project.query';
import { ProjectService } from 'src/app/project/project.service';
import { switchMap, filter } from 'rxjs/operators';
import { sorting } from 'src/app/project/project.store';
import { HealthIndicatorQuery } from 'src/app/health-indicator/health-indicator.query';

@Component({
  selector: 'app-portfolio-dashboard',
  templateUrl: './portfolio-dashboard.component.html',
  styleUrls: ['./portfolio-dashboard.component.scss']
})
export class PortfolioDashboardComponent implements OnInit {

  public projects$: Observable<ProjectEntity[]>;
  public currentSortOrder$: Observable<sorting>;

  public selectedPortfolio$ = this._portfolioQuery.selectActive();

  constructor(
    private readonly _portfolioQuery: PortfolioQuery,
    private readonly _projectQuery: ProjectQuery,
    private readonly _projectService: ProjectService) {
      this._projectService.loadProjects();
    }

  ngOnInit() {
    this.projects$ = this.selectedPortfolio$.pipe(
      switchMap(_ => this._projectQuery.projects$),
      filter(p => p !== undefined && p.length > 0)
    );
    this.currentSortOrder$ = this._projectQuery.sortOrder$;
  }

  public changeSortOrder(newOrder: sorting) {
    this._projectService.updateSortOrder(newOrder);
  }

}
