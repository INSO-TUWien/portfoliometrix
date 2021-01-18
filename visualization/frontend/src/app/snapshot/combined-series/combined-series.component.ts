import { Component, OnInit } from '@angular/core';
import { SnapshotMetricSelectionService } from '../snapshot-metric-selection/snapshot-metric-selection.service';
import { SnapshotMetricSelectionQuery } from '../snapshot-metric-selection/snapshot-metric-selection.query';
import { MetricChangeEvent } from 'src/app/metric/metric.entity';

@Component({
  selector: 'app-combined-series',
  templateUrl: './combined-series.component.html',
  styleUrls: ['./combined-series.component.scss']
})
export class CombinedSeriesComponent implements OnInit {

  public metricSelection$ = this._snapshotMetricSelectionQuery.selectionForCombinedSeries$;
  
  constructor(
    private readonly _metricSelectionService: SnapshotMetricSelectionService,
    private readonly _snapshotMetricSelectionQuery: SnapshotMetricSelectionQuery) {}

  ngOnInit() {
  }

  public onMetricSelectionChanged(changeEvent: MetricChangeEvent) {
    this._metricSelectionService.updateMetricSelection('CombinedSeries', changeEvent);
  }
}
