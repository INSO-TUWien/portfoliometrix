import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import * as shape from 'd3-shape';
import { Observable } from 'rxjs';
import { PolarChartDataForProject } from '../polar-chart.entity';
import { ProjectQuery } from 'src/app/project/project.query';
import { flatMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-polart-chart-item',
  templateUrl: './polart-chart-item.component.html',
  styleUrls: ['./polart-chart-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolartChartItemComponent implements OnInit {

  public curve = shape.curveLinearClosed;

  @Input()
  public series$: Observable<PolarChartDataForProject[]>;

  @Input()
  public chartWidth: number;

  public customColors$: Observable<{name: string; value: string;}[]>;

  constructor(private readonly _projectQuery: ProjectQuery) {
    this.customColors$ = this._projectQuery.selectAll().pipe(
      map(p => p.map(x => ({name: x.id, value: 'green'})))
    );
  }

  ngOnInit() { 
  }
}
