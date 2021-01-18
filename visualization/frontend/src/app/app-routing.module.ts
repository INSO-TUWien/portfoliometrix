import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { CommonModule } from '@angular/common';
import { PortfolioDashboardComponent } from './portfolio/portfolio-dashboard/portfolio-dashboard.component';
import { SnapshotOverviewComponent } from './snapshot/snapshot-overview/snapshot-overview.component';

const routes: Routes = [
  {path: 'dashboard', component: PortfolioDashboardComponent},
  {path: 'snapshot', component: SnapshotOverviewComponent},
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
