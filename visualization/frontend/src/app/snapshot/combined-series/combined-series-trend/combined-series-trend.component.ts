import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CombinedSeriesTrendService } from './combined-series-trend.service';
import { CombinedSeriesTrendQuery } from './combined-series-trend.query';
import { CombinedTrendSeriesEntity } from './combined-series-trend.entity';
import { Observable, combineLatest, fromEvent } from 'rxjs';
import { map, filter, delay, tap } from 'rxjs/operators';
import { LineChartComponent } from '@swimlane/ngx-charts';
import { SnapshotMetricSelectionQuery } from '../../snapshot-metric-selection/snapshot-metric-selection.query';
import { TrendVisualizationControl } from 'src/app/trend-visualization/trend-visualization-control/trend-visualization-control';
import { TrendSeriesRange } from 'src/app/trend-visualization/trend-visualization-series.entity';
import { ProjectSelectionQuery } from '../../project-selection/project-selection.query';
import { ResizedEvent } from 'angular-resize-event';
import { ReferenceLine } from 'src/app/health-indicator/health-indicator.entity';

@Component({
  selector: 'app-combined-series-trend',
  templateUrl: './combined-series-trend.component.html',
  styleUrls: ['./combined-series-trend.component.scss']
})
export class CombinedSeriesTrendComponent implements OnInit {

  public series$: Observable<CombinedTrendSeriesEntity[]>;
  public colorPalette$: Observable<{ name: string, value: string }[]>;
  public selectedSnapshotIndex$: Observable<number>;
  public currentTimeLinePosition$: Observable<number>;
  public visualizationControls$: Observable<TrendVisualizationControl>;
  public range$: Observable<TrendSeriesRange>;
  public referenceLines$: Observable<ReferenceLine[]>;
  public showSlider = false;

  SNAPSHOT_MAX_INDEX = 49;

  public sliderWidth = 0;
  public sliderOffset = 0;

  @ViewChild('chart', { static: true })
  public chart: LineChartComponent;

  @ViewChild('slider', { static: true })
  public slider: ElementRef<HTMLInputElement>;

  constructor(
    private readonly _service: CombinedSeriesTrendService,
    private readonly _query: CombinedSeriesTrendQuery,
    private readonly _metricSelectionQuery: SnapshotMetricSelectionQuery) {
  }

  ngOnInit() {

    this.visualizationControls$ = this._query.visualizationControls$;
    this.series$ = this._query.selectAll();
    this.colorPalette$ = this._query.colorPalette$;
    this.selectedSnapshotIndex$ = this._query.selectedSnapshotIndex$;
    this.range$ = this._query.range$;
    this.referenceLines$ = this._query.referenceLines$;

    // triggers whenever the chart changes its legend offset position
    const chartLayoutRecalculation$ =
      combineLatest([
        this._metricSelectionQuery.selectionForCombinedSeries$,
        this._query.visualizationControls$,
        //this._projectSelectionQuery.projectSelections$
      ]).pipe(
        delay(1000)
      );

    // position of the slider should change whenever the chart layout changes
    // and the current position changes
    this.currentTimeLinePosition$ =
      combineLatest([
        this.selectedSnapshotIndex$,
        chartLayoutRecalculation$
      ]).pipe(
        filter(([index, _]) => {
          return index !== undefined;
        }),
        map(([index, _]) => {
          const position = (this.chart.dims.width / this.SNAPSHOT_MAX_INDEX * index) + this.chart.dims.xOffset;
          return position;
        })
      );

    chartLayoutRecalculation$.subscribe(_ => {
      if(this.chart === undefined || this.chart.dims === undefined) {
        return;
      }
      this.sliderWidth = this.chart.dims.width + 10;
      this.sliderOffset = this.chart.dims.xOffset - 5;
    });

    this._service.updateSnapshotPosition(undefined);

    // start a timer that fixes the inital position
    setTimeout(() => {
      this.sliderWidth = this.chart.dims.width + 10;
      this.sliderOffset = this.chart.dims.xOffset - 5;
      this._service.updateSnapshotPosition(0);
      this.showSlider = true;
    }, 2000);
  }

  public sliderChanged(value: string) {
    const commitIndex = Number(value);
    this._service.updateSnapshotPosition(commitIndex);
  }

  public onControlsChanged(control: TrendVisualizationControl) {
    this._service.updateControls(control);
  }
}
