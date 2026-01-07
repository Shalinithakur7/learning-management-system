import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { ManageUsers } from './manage-users/manage-users';
import { ManageCourses } from './manage-courses/manage-courses';
import { AuthGuard } from '../core/auth/auth-guard';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], component: AdminDashboardComponent },
  { path: 'users', canActivate: [AuthGuard], component: ManageUsers },
  { path: 'courses', canActivate: [AuthGuard], component: ManageCourses }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
