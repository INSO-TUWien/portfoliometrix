import { Component, OnInit, Input } from '@angular/core';
import { MetricQuery } from '../../metric/metric.query';
import { Observable } from 'rxjs';
import { TrendVisualizationRowEntity } from '../trend-visualization-row/trend-visualization-row.entity';
import { TrendVisualizationRowQuery } from '../trend-visualization-row/trend-visualization-row.query';
import { TrendVisualizationRowService } from '../trend-visualization-row/trend-visualization-row.service';
import { ProjectEntity } from 'src/app/project/project.entity';

@Component({
  selector: 'app-trend-visualization-list',
  templateUrl: './trend-visualization-list.component.html',
  styleUrls: ['./trend-visualization-list.component.scss']
})
export class TrendVisualizationListComponent implements OnInit {

  @Input()
  public projects$: Observable<ProjectEntity[]>;

  public rows$: Observable<TrendVisualizationRowEntity[]>;
  constructor(
    private readonly _query: TrendVisualizationRowQuery,
    private readonly _metricQuery: MetricQuery,
    private readonly _trendVisualizationRowService: TrendVisualizationRowService) { }

  ngOnInit() {
    this.rows$ = this._query.rows$;
    this._metricQuery.metrics$.subscribe(metrics => {
      this._trendVisualizationRowService.createVisualizationRows(metrics);
    });
  }
}
