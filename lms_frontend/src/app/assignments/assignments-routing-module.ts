import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignmentListComponent } from './assignment-list/assignment-list';
import { AssignmentFormComponent } from './assignment-form/assignment-form';
import { SubmitAssignmentComponent } from './submit-assignment/submit-assignment';
import { AuthGuard } from '../core/auth/auth-guard';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], component: AssignmentListComponent },
  { path: 'create', canActivate: [AuthGuard], component: AssignmentFormComponent },
  { path: ':id/edit', canActivate: [AuthGuard], component: AssignmentFormComponent },
  { path: 'submit/:id', canActivate: [AuthGuard], component: SubmitAssignmentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignmentsRoutingModule { }
