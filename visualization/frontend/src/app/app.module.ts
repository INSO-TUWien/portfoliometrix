import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularResizedEventModule } from 'angular-resize-event';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PortfolioSelectionComponent } from './portfolio/portfolio-selection/portfolio-selection.component';
import { ProjectListComponent } from './project/project-list/project-list.component';
import { ProjectListItemComponent } from './project/project-list-item/project-list-item.component';
import { PortfolioOverviewComponent } from './portfolio/portfolio-overview/portfolio-overview.component';
import { TrendVisualizationRowComponent } from './trend-visualization/trend-visualization-row/trend-visualization-row.component';
import { TrendVisualizationListComponent } from './trend-visualization/trend-visualization-list/trend-visualization-list.component';
import { MetricSelectionComponent } from './metric/metric-selection/metric-selection.component';
import { TrendVisualizationSeriesComponent } from './trend-visualization/trend-visualization-series/trend-visualization-series.component';
import { TrendVisualizationControlComponent } from './trend-visualization/trend-visualization-control/trend-visualization-control.component';
import { HealthIndicatorViewComponent } from './health-indicator/health-indicator-view/health-indicator-view.component';
import { HealthIndicatorFormComponent } from './health-indicator/health-indicator-form/health-indicator-form.component';
import { HealthIndicatorIconComponent } from './health-indicator/health-indicator-icon/health-indicator-icon.component';
import { ProjectHealthIndicatorViewComponent } from './health-indicator/project-health-indicator-view/project-health-indicator-view.component';
import { AppRoutingModule } from './app-routing.module';
import { PortfolioDashboardComponent } from './portfolio/portfolio-dashboard/portfolio-dashboard.component';
import { SnapshotOverviewComponent } from './snapshot/snapshot-overview/snapshot-overview.component';
import { CombinedSeriesComponent } from './snapshot/combined-series/combined-series.component';
import { ProjectSelectionListComponent } from './snapshot/project-selection/project-selection-list/project-selection-list.component';
import { CombinedSeriesTrendComponent } from './snapshot/combined-series/combined-series-trend/combined-series-trend.component';
import { ProjectSnapshotListComponent } from './snapshot/project-snapshot/project-snapshot-list/project-snapshot-list.component';
import { DistributionListComponent } from './snapshot/distribution/distribution-list/distribution-list.component';
import { DistributionListItemComponent } from './snapshot/distribution/distribution-list-item/distribution-list-item.component';
import { EntityFilterComponent } from './snapshot/entity-filter/entity-filter.component';
import { EntityListComponent } from './snapshot/entity/entity-list/entity-list.component';
import { PolartChartListComponent } from './snapshot/polar-chart/polart-chart-list/polart-chart-list.component';
import { PolartChartItemComponent } from './snapshot/polar-chart/polart-chart-item/polart-chart-item.component';
import { MinMaxPipe } from './min-max.pipe';

@NgModule({
  declarations: [
    AppComponent,
    PortfolioSelectionComponent,
    ProjectListComponent,
    ProjectListItemComponent,
    PortfolioOverviewComponent,
    TrendVisualizationRowComponent,
    TrendVisualizationListComponent,
    MetricSelectionComponent,
    TrendVisualizationSeriesComponent,
    TrendVisualizationControlComponent,
    HealthIndicatorViewComponent,
    HealthIndicatorFormComponent,
    HealthIndicatorIconComponent,
    ProjectHealthIndicatorViewComponent,
    PortfolioDashboardComponent,
    SnapshotOverviewComponent,
    CombinedSeriesComponent,
    ProjectSelectionListComponent,
    CombinedSeriesTrendComponent,
    ProjectSnapshotListComponent,
    DistributionListComponent,
    DistributionListItemComponent,
    EntityFilterComponent,
    EntityListComponent,
    PolartChartListComponent,
    PolartChartItemComponent,
    MinMaxPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    AppRoutingModule,
    AngularResizedEventModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
