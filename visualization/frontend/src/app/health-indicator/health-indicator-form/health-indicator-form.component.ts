import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MetricQuery } from 'src/app/metric/metric.query';
import { MetricEntity, SLOC } from 'src/app/metric/metric.entity';
import { Observable, Subscription } from 'rxjs';
import { HealthIndicatorEntity } from '../health-indicator.entity';
import { MetricRuleEntity } from '../metric-rule.entity';
import { HealthStateQuery } from 'src/app/health-state/health-state.query';
import { OverallHealthState } from 'src/app/health-state/health-state.entity';

@Component({
  selector: 'app-health-indicator-form',
  templateUrl: './health-indicator-form.component.html',
  styleUrls: ['./health-indicator-form.component.scss']
})
export class HealthIndicatorFormComponent implements OnInit, OnDestroy {

  private _subscription: Subscription;
  private _indicator: HealthIndicatorEntity;

  public get isProjectIndicator(): boolean {
    return this._indicator !== undefined && this._indicator.targetType === 'Project';
  }

  public isVisible = false;
  public closed: EventEmitter<boolean> = new EventEmitter();
  public metrics$: Observable<MetricEntity[]>;
  public overallHealthState$: Observable<OverallHealthState>;
  public healthIndicatorForm: FormGroup;
  public metricRules: FormArray;

  @Input()
  public healthStateQuery: HealthStateQuery;

  @Output()
  public indicatorUpdated: EventEmitter<HealthIndicatorEntity> = new EventEmitter();
  @Output()
  public indicatorDeleted: EventEmitter<HealthIndicatorEntity> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private _metricQuery: MetricQuery
  ) {

    this.metrics$ = this._metricQuery.selectAll();
    this.metricRules = this.formBuilder.array([]);
    this.healthIndicatorForm = this.formBuilder.group({
      name: '',
      rules: this.metricRules
    });
  }

  /**
   * opens the dialog and shows its rules and health states
   * @param indicator the health indicator which is shown in the dialog
   */
  public initializeDialog(indicator: HealthIndicatorEntity, entityId: string) {

    this._indicator = indicator;

    this.metricRules = this.formBuilder.array([]);
    this.healthIndicatorForm = this.formBuilder.group({
      name: this._indicator.name,
      rules: this.metricRules
    });

    this._indicator.rules.forEach(rule => {
      this.metricRules.push(this.formBuilder.group({
        metric: rule.metric.id,
        lowerThreshold: rule.lowerThreshold,
        upperThreshold: rule.upperThreshold,
        aggregate: rule.aggregate,
        affectsHealth: rule.affectsHealth,
        stateMessage: 'not calculated, press "Apply" to evaluate health',
        state: 'none'
      }));
    });

    this.isVisible = true;
    this._subscription =
      this.healthStateQuery.getWorstHealthStatePerMetrics(entityId).subscribe(
        states => {
          states.forEach(metricState => {
            this.metricRules.controls.forEach((group: FormGroup) => {
              const metricId = group.get('metric').value;
              if (metricState.metricId === metricId) {
                group.patchValue({ stateMessage: metricState.message });
                group.patchValue({ state: metricState.state });
              }
            });
          });
        }
      );
    this.overallHealthState$ = this.healthStateQuery.getWorstHealthStateForEntity(entityId);
  }


  ngOnInit(): void { }

  ngOnDestroy(): void {
    if (this._subscription !== undefined) {
      this._subscription.unsubscribe();
    }
  }

  public newRule() {
    this.metricRules.push(this.formBuilder.group({
      metric: SLOC,
      lowerThreshold: undefined,
      upperThreshold: undefined,
      aggregate: 'median',
      affectsHealth: true,
      // checks whether this rule is inherited from parent, never the case with new rules
      fromPortfolio: false,
      stateMessage: 'not calculated, press "Apply" to evaluate health',
      state: 'none'
    }));
  }

  public removeRule(index: number) {
    this.metricRules.removeAt(index);
  }

  public apply() {

    const changedIndicator: HealthIndicatorEntity = {
      ...this._indicator,
      rules: []
    };
    // the indicator does always exist, so no need for additional checks here
    changedIndicator.name = this.healthIndicatorForm.controls.name.value;

    this.metricRules.controls.forEach((group: FormGroup) => {
      const metricRule: MetricRuleEntity = {
        id: undefined, // metric rules will all be regenerated, so no need for id
        metric: this._metricQuery.getEntity(group.controls.metric.value),
        lowerThreshold: group.controls.lowerThreshold.value,
        upperThreshold: group.controls.upperThreshold.value,
        aggregate: group.controls.aggregate.value,
        affectsHealth: group.controls.affectsHealth.value
      };
      changedIndicator.rules.push(metricRule);
    });
    this.indicatorUpdated.emit(changedIndicator);
  }

  public ok() {
    this.apply();
    this.isVisible = false;
    this.closed.emit(true);
  }

  public closeDialog() {
    this.isVisible = false;
    this.closed.emit(true);
  }

  public delete() {
    const confirmed = confirm('Do you want to delete this project specific indicator?');
    if (confirmed) {
      this.isVisible = false;
      this.indicatorDeleted.emit(this._indicator);
    }
  }
}
