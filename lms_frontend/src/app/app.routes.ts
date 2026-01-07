import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth-guard';
import { StudentDashboardComponent } from './student/student-dashboard/student-dashboard';
import { BrowseCoursesComponent } from './student/browse-courses/browse-courses';
import { StudentAssignmentsComponent } from './student/student-assignments/student-assignments';
import { StudentCourseDetailsComponent } from './student/course-details/student-course-details';
import { ManageEnrollmentsComponent } from './admin/manage-enrollments/manage-enrollments';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  // AUTH PAGES (NO SIDEBAR)
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register').then(m => m.RegisterComponent)
  },

  // MAIN APP (WITH SIDEBAR)
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'courses',
        loadChildren: () =>
          import('./courses/courses-module')
            .then(m => m.CoursesModule)
      },
      {
        path: 'enrollment',
        loadChildren: () =>
          import('./enrollment/enrollment-module')
            .then(m => m.EnrollmentModule)
      },
      {
        path: 'assignments',
        loadChildren: () =>
          import('./assignments/assignments-module')
            .then(m => m.AssignmentsModule)
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./reports/reports.module')
            .then(m => m.ReportsModule)
      },
      {
        path: 'submissions',
        loadComponent: () =>
          import('./assignments/submissions-list/submissions-list').then(m => m.SubmissionsListComponent)
      },
      {
        path: 'student/dashboard',
        component: StudentDashboardComponent
      },
      {
        path: 'student/browse-courses',
        component: BrowseCoursesComponent
      },
      {
        path: 'student/assignments',
        component: StudentAssignmentsComponent
      },
      {
        path: 'student/course/:id',
        component: StudentCourseDetailsComponent
      },
      {
        path: 'admin',
        children: [
          {
            path: 'enrollments',
            component: ManageEnrollmentsComponent
          },
          {
            path: '',
            loadChildren: () => import('./admin/admin-module').then(m => m.AdminModule)
          }
        ]
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
