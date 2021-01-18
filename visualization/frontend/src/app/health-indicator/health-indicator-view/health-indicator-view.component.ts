import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HealthIndicatorEntity } from '../health-indicator.entity';
import { Observable } from 'rxjs';
import { OverallHealthState } from 'src/app/health-state/health-state.entity';
import { PortfolioHealthStateQuery } from 'src/app/health-state/health-state.query';
import { flatMap } from 'rxjs/operators';

@Component({
  selector: 'app-health-indicator-view',
  templateUrl: './health-indicator-view.component.html',
  styleUrls: ['./health-indicator-view.component.scss']
})
export class HealthIndicatorViewComponent implements OnInit {

  @Input()
  public healthIndicator$: Observable<HealthIndicatorEntity>;
  @Output()
  public updateHealthIndicator: EventEmitter<HealthIndicatorEntity> = new EventEmitter();

  public healthState$: Observable<OverallHealthState>;

  constructor(public readonly healthStateQuery: PortfolioHealthStateQuery) {}

  ngOnInit() {

    this.healthState$ = this.healthIndicator$.pipe(
      flatMap(h => {
        return this.healthStateQuery.getWorstHealthStateForEntity(undefined); // portfolio id currently not used
      })
    );

    // this.healthState$.subscribe();
  }

}
