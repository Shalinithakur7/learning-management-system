import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseListComponent } from './course-list/course-list';
import { CourseDetailsComponent } from './course-details/course-details';
import { MyCoursesComponent } from './my-courses/my-courses';
import { AuthGuard } from '../core/auth/auth-guard';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], component: CourseListComponent },
  { path: 'my', canActivate: [AuthGuard], component: MyCoursesComponent },
  { path: 'create', canActivate: [AuthGuard], loadComponent: () => import('./create-course/create-course').then(m => m.CreateCourseComponent) },
  { path: 'edit/:id', canActivate: [AuthGuard], loadComponent: () => import('./create-course/create-course').then(m => m.CreateCourseComponent) },
  { path: ':id', canActivate: [AuthGuard], component: CourseDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoursesRoutingModule { }
