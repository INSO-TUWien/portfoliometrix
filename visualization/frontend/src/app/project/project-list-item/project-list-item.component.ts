import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProjectEntity } from '../project.entity';
import { HealthIndicatorQuery } from 'src/app/health-indicator/health-indicator.query';
import { ProjectHealthStateQuery } from 'src/app/health-state/health-state.query';

@Component({
  selector: 'app-project-list-item',
  templateUrl: './project-list-item.component.html',
  styleUrls: ['./project-list-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectListItemComponent implements OnInit {

  @Input()
  public project: ProjectEntity;

  constructor(
    public readonly indicatorQuery: HealthIndicatorQuery,
    public readonly healthStateQuery: ProjectHealthStateQuery) {}

  ngOnInit(): void {}
}
