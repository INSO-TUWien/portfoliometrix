import { Component, OnInit, Input } from '@angular/core';
import { MetricChangeEvent } from 'src/app/metric/metric.entity';
import { TrendVisualizationRowEntity } from './trend-visualization-row.entity';
import { ProjectQuery } from 'src/app/project/project.query';
import { Observable, combineLatest, of } from 'rxjs';
import { TrendVisualizationCellService } from '../trend-visualization-cell/trend-visualization-cell.service';
import { map, flatMap } from 'rxjs/operators';
import { trendVisualizationCellFactory, TrendVisualizationCellEntity } from '../trend-visualization-cell/trend-visualization-cell.entity';
import { TrendVisualizationCellQuery } from '../trend-visualization-cell/trend-visualization-cell.query';
import { TrendVisualizationRowService } from './trend-visualization-row.service';
import { TrendVisualizationControl } from '../trend-visualization-control/trend-visualization-control';
import { HealthIndicatorQuery } from 'src/app/health-indicator/health-indicator.query';
import { ProjectEntity } from 'src/app/project/project.entity';

@Component({
  selector: 'app-trend-visualization-row',
  templateUrl: './trend-visualization-row.component.html',
  styleUrls: ['./trend-visualization-row.component.scss']
})
export class TrendVisualizationRowComponent implements OnInit {

  @Input()
  public row: TrendVisualizationRowEntity;
  @Input()
  public projects: ProjectEntity[];

  public cells$: Observable<TrendVisualizationCellEntity[]>;

  constructor(
    private readonly _cellService: TrendVisualizationCellService,
    private readonly _rowService: TrendVisualizationRowService,
    private readonly _cellQuery: TrendVisualizationCellQuery,
    private readonly _indicatorQuery: HealthIndicatorQuery,
    private readonly _projectQuery: ProjectQuery) {}

  ngOnInit() {

    this.cells$ =
      this._cellQuery.selectAll({
      filterBy: x => x.rowId === this.row.id
    }).pipe(
      flatMap(x => this._cellService.sortByProject(x)));

    const cells = this.projects.map((project, index) => {
      return trendVisualizationCellFactory(`${this.row.id}${index}`, this.row.id, this.row.metrics, project);
    });
    // ensure that cell order is updated whenever the sorting changes
    combineLatest([
      of(true),
      this._projectQuery.sortOrder$
    ]).subscribe(_ => {
      this._cellService.setupAndAddCells(cells, this.row.controls);
    });

    // if portfolio has changed, only change the cells without a project indicator,
    // if projects have changed, change all cells that are related to a project indicator
    this._indicatorQuery.portfolioIndicator$.subscribe(indicator => { // there is always only one portfolio indicator
      const cells = this._cellQuery.getAll({filterBy: cell => cell.rowId === this.row.id});
      cells.forEach(c => {
        // project of this cell does not have a dedicated indicator => react on portfolio changes
        if (this._indicatorQuery.getProjectIndicator(c.project.id).targetType === 'Portfolio') {
          this._cellService.updateReferenceLine(c, indicator, this.row.controls);
        }
      });
    });

    this._indicatorQuery.selectAll().subscribe(_ => {
      const cells = this._cellQuery.getAll({filterBy: cell => cell.rowId === this.row.id});
      cells.forEach(c => {
        // project of this cell does not have a dedicated indicator => react on portfolio changes
        const projectIndicator = this._indicatorQuery.getProjectIndicator(c.project.id);
        if (projectIndicator.targetType === 'Project') {
          this._cellService.updateReferenceLine(c, projectIndicator, this.row.controls);
        }
      });
    });
  }

  public onMetricSelectionChanged(changeEvent: MetricChangeEvent) {
    this._rowService.changeMetricSelection(this.row.id, changeEvent);
  }

  public onControlsChanged(controls: TrendVisualizationControl) {
    this._rowService.changeControls(this.row.id, controls);
  }
}
