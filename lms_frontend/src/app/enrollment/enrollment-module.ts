import { NgModule } from '@angular/core';
import { EnrollmentRoutingModule } from './enrollment-routing-module';
import { EnrollComponent } from './enroll/enroll';
import { ApproveEnrollmentComponent } from './approve-enrollment/approve-enrollment';

@NgModule({
  imports: [
    EnrollmentRoutingModule,
    EnrollComponent,
    ApproveEnrollmentComponent
  ]
})
export class EnrollmentModule {}
