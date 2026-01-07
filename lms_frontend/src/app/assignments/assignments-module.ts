import { NgModule } from '@angular/core';
import { AssignmentsRoutingModule } from './assignments-routing-module';
import { AssignmentListComponent } from './assignment-list/assignment-list';
import { SubmitAssignmentComponent } from './submit-assignment/submit-assignment';

@NgModule({
  imports: [
    AssignmentsRoutingModule,
    AssignmentListComponent,
    SubmitAssignmentComponent
  ]
})
export class AssignmentsModule {}
