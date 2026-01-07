import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

import { CourseListComponent } from './course-list/course-list';
import { CourseDetailsComponent } from './course-details/course-details';
import { MyCoursesComponent } from './my-courses/my-courses';
import { CoursesRoutingModule } from './courses-routing-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    CoursesRoutingModule
  ]
})
export class CoursesModule {}
