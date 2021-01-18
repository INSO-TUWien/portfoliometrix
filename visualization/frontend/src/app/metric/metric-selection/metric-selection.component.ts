import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MetricSelection, MetricChangeEvent } from '../metric.entity';
import { Observable } from 'rxjs';
import { MetricQuery } from '../metric.query';

@Component({
  selector: 'app-metric-selection',
  templateUrl: './metric-selection.component.html',
  styleUrls: ['./metric-selection.component.scss']
})
export class MetricSelectionComponent implements OnInit {

  private _metricSelections: MetricSelection[];
  public get metricSelections(): MetricSelection[] {
    return this._metricSelections;
  }
  @Input()
  public set metricSelections(value: MetricSelection[]) {
    this._metricSelections = value;
  }
  public colorMap: {[metric: string]: string} = {};

  @Output()
  public stateChanged: EventEmitter<MetricChangeEvent> = new EventEmitter();

  constructor(metricQuery: MetricQuery) {
    this.colorMap = metricQuery.colorMap;
  }

  ngOnInit() {
  }

}
