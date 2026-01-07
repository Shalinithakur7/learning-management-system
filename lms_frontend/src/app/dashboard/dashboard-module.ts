import { NgModule } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard';
import { DashboardRoutingModule } from './dashboard-routing-module';

@NgModule({
  imports: [DashboardComponent, DashboardRoutingModule]
})
export class DashboardModule {}
