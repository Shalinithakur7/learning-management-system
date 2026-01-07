import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnrollComponent } from './enroll/enroll';
import { ApproveEnrollmentComponent } from './approve-enrollment/approve-enrollment';
import { AuthGuard } from '../core/auth/auth-guard';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], component: EnrollComponent },
  { path: 'approve', canActivate: [AuthGuard], component: ApproveEnrollmentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnrollmentRoutingModule {}
