import { Component, OnInit, APP_INITIALIZER, Input, Output, EventEmitter } from '@angular/core';
import { TrendVisualizationControl } from './trend-visualization-control';

@Component({
  selector: 'app-trend-visualization-control',
  templateUrl: './trend-visualization-control.component.html',
  styleUrls: ['./trend-visualization-control.component.scss']
})
export class TrendVisualizationControlComponent implements OnInit {

  @Output()
  public controlChanged: EventEmitter<TrendVisualizationControl> = new EventEmitter();

  private _controls: TrendVisualizationControl;
  public get controls(): TrendVisualizationControl {
    return this._controls;
  }
  @Input()
  public set controls(value: TrendVisualizationControl) {
    this._controls = value;
  }

  @Input()
  public showThresholdButtons = true;

  constructor() { }

  ngOnInit() {
  }

}
