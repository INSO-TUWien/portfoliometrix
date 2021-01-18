import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { HealthIndicatorEntity } from '../health-indicator.entity';
import { OverallHealthState } from 'src/app/health-state/health-state.entity';
import { ProjectHealthStateQuery } from 'src/app/health-state/health-state.query';
import { filter, take } from 'rxjs/operators';
import { HealthIndicatorFormComponent } from '../health-indicator-form/health-indicator-form.component';
import { HealthIndicatorService } from '../health-indicator.service';
import { ProjectQuery } from 'src/app/project/project.query';
import { HealthIndicatorQuery } from '../health-indicator.query';

@Component({
  selector: 'app-project-health-indicator-view',
  templateUrl: './project-health-indicator-view.component.html',
  styleUrls: ['./project-health-indicator-view.component.scss']
})
export class ProjectHealthIndicatorViewComponent implements OnInit {

  public chooseIndicatorMessageBoxIsVisible = false;

  @Input()
  public indicator$: Observable<HealthIndicatorEntity>;
  @Input()
  public healthState$: Observable<OverallHealthState>;
  @Input()
  public projectId: string;

  @ViewChild(HealthIndicatorFormComponent, { static: true })
  public healthIndicatorForm: HealthIndicatorFormComponent;

  constructor(
    public readonly healthStateQuery: ProjectHealthStateQuery,
    public readonly _indicatorQuery: HealthIndicatorQuery,
    private readonly _healthIndicatorService: HealthIndicatorService,
    private readonly _projectQuery: ProjectQuery) {
  }

  ngOnInit() {
  }

  public updateHealthIndicator(healthIndicator: HealthIndicatorEntity) {
    this._healthIndicatorService.createOrUpdateIndicator(healthIndicator);
  }

  public deleteHealthIndicator(healthIndicator: HealthIndicatorEntity) {
    this._healthIndicatorService.deleteHealthIndicator(healthIndicator);
  }

  public openIndicatorDialog(projectId: string) {
    const indicator = this._indicatorQuery.getProjectIndicator(projectId);
    // if this is only the portfolio indicator, ask user to create a project related one
    if (indicator.targetType === 'Portfolio') {
      this.chooseIndicatorMessageBoxIsVisible = true;
    } else {
      this.healthIndicatorForm.initializeDialog(indicator, projectId);
    }
  }

  public cancelMessageBox() {
    this.chooseIndicatorMessageBoxIsVisible = false;
  }

  public createProjectIndicator() {
    this.chooseIndicatorMessageBoxIsVisible = false;
    const portfolioIndicator = this._indicatorQuery.getValue().portfolioIndicator;
    const project = this._projectQuery.getEntity(this.projectId);
    const prototype: HealthIndicatorEntity = {
      id: undefined,
      name: project.name,
      rules: portfolioIndicator.rules,
      targetType: 'Project',
      targetId: this.projectId
    };

    this._indicatorQuery.selectProjectIndicator(this.projectId).pipe(
      filter(p => p.targetType === 'Project'),
      take(1)
    ).subscribe(indicator => {
      this.healthIndicatorForm.initializeDialog(indicator, this.projectId);
    });

    // now create a new project indicator, so that our subscriber could react on it
    this._healthIndicatorService.createOrUpdateIndicator(prototype);
  }

  public usePortfolioIndicator() {
    this.chooseIndicatorMessageBoxIsVisible = false;
    const portfolioIndicator = this._indicatorQuery.getProjectIndicator(this.projectId);
    this.healthIndicatorForm.initializeDialog(portfolioIndicator, this.projectId);
  }
}
