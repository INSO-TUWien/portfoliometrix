import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { OverallHealthState } from 'src/app/health-state/health-state.entity';

@Component({
  selector: 'app-health-indicator-icon',
  templateUrl: './health-indicator-icon.component.html',
  styleUrls: ['./health-indicator-icon.component.scss']
})
export class HealthIndicatorIconComponent implements OnInit {

  @Input()
  public healthState$: Observable<OverallHealthState>;

  @Input()
  public indicatorName: string;

  constructor() { }

  ngOnInit() {
  }

}
