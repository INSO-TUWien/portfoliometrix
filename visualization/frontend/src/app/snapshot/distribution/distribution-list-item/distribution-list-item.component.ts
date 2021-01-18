import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { MetricQuery } from 'src/app/metric/metric.query';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-distribution-list-item',
  templateUrl: './distribution-list-item.component.html',
  styleUrls: ['./distribution-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionListItemComponent implements OnInit {

  @Input()
  public series$: Observable<{
    name: string;
    value: number;
  }[]>;

  @Input()
  public metric: string;

  @Input()
  public chartWidth: number;

  constructor(private readonly _metricQuery: MetricQuery) { }

  ngOnInit() {
  }

  public customColor(param: any): string {
    return this._metricQuery.colorMap[this.metric];
  }
}
