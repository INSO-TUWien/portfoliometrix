import { Component, OnInit, Input } from '@angular/core';
import { TrendVisualizationSeries, TrendSeriesRange } from '../trend-visualization-series.entity';
import { ReferenceLine } from 'src/app/health-indicator/health-indicator.entity';
import { MetricQuery } from 'src/app/metric/metric.query';
import { ProjectQuery } from 'src/app/project/project.query';

@Component({
  selector: 'app-trend-visualization-series',
  templateUrl: './trend-visualization-series.component.html',
  styleUrls: ['./trend-visualization-series.component.scss']
})
export class TrendVisualizationSeriesComponent implements OnInit {

  @Input()
  public series: TrendVisualizationSeries[];
  @Input()
  public referenceLines: ReferenceLine[];
  @Input()
  public range: TrendSeriesRange;

  public tileWidth$ = this._projectQuery.projectTileWidth$;

  customColors: {
    name: string;
    value: string;
  }[] = [];

  constructor(
    private readonly _metricQuery: MetricQuery,
    private readonly _projectQuery: ProjectQuery) { }

  ngOnInit() {
      this.customColors = this.series.map(s => ({
        name: s.metric,
        value: this._metricQuery.colorMap[s.metric]
      }));
  }
}
