import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router } from '@angular/router';
import { AssignmentService } from '../assignment.service';
import { CourseService } from '../../courses/course.service';
import { AuthService } from '../../core/auth/auth';
import { EnrollmentService } from '../../enrollment/enrollment.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { forkJoin } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface CourseWithAssignments {
  id: number;
  title: string;
  category?: string;
  isPublished: boolean;
  assignments: any[];
  totalAssignments: number;
  expanded: boolean;
}

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './assignment-list.html',
  styleUrls: ['./assignment-list.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AssignmentListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'totalAssignments', 'status', 'actions'];
  dataSource: MatTableDataSource<CourseWithAssignments>;
  role: string | null = null;
  expandedCourse: CourseWithAssignments | null = null;

  assignmentColumns: string[] = ['title', 'description', 'dueDate', 'maxMarks', 'submissionType', 'status', 'createdOn', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private assignmentService: AssignmentService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.role = this.auth.getRole();
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    if (this.role === 'Instructor') {
      this.loadInstructorCourses();
    } else if (this.role === 'Student') {
      this.loadStudentAssignments();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadInstructorCourses() {
    this.courseService.getMyCourses().subscribe(courses => {
      const coursesWithAssignments: CourseWithAssignments[] = courses.map((course: any) => ({
        id: course.id,
        title: course.title,
        category: course.category || 'General',
        isPublished: course.isPublished,
        assignments: [],
        totalAssignments: 0,
        expanded: false
      }));

      // Load assignment counts for each course
      const assignmentRequests = coursesWithAssignments.map(course =>
        this.assignmentService.getByCourse(course.id)
      );

      forkJoin(assignmentRequests).subscribe(assignmentsArray => {
        assignmentsArray.forEach((assignments, index) => {
          coursesWithAssignments[index].assignments = assignments;
          coursesWithAssignments[index].totalAssignments = assignments.length;
        });

        this.dataSource.data = coursesWithAssignments;
        this.cdr.detectChanges();
      });
    });
  }

  loadStudentAssignments() {
    this.enrollmentService.myEnrollments().subscribe(enrollments => {
      // 1. Filter Approved Enrollments
      const approvedEnrollments = enrollments.filter(e => e.status === 'Approved');

      const coursesWithAssignments: CourseWithAssignments[] = approvedEnrollments.map((e: any) => ({
        id: e.courseId,
        title: e.courseTitle,
        category: 'Enrolled',
        isPublished: true,
        assignments: [],
        totalAssignments: 0,
        expanded: false
      }));

      // 2. Fetch Assignments & Submissions
      if (coursesWithAssignments.length > 0) {
        const assignmentRequests = coursesWithAssignments.map(course =>
          this.assignmentService.getByCourse(course.id)
        );

        forkJoin({
          assignments: forkJoin(assignmentRequests),
          submissions: this.assignmentService.mySubmissions()
        }).subscribe(({ assignments, submissions }) => {

          assignments.forEach((courseAssignments, index) => {
            const course = coursesWithAssignments[index];

            // Map assignments with status
            course.assignments = courseAssignments.map((a: any) => {
              const sub = submissions.find((s: any) => s.assignmentId === a.id);
              return {
                ...a,
                status: sub ? (sub.status || 'Submitted') : 'Pending', // Fallback status if missing
                submission: sub
              };
            });

            course.totalAssignments = course.assignments.length;
          });

          this.dataSource.data = coursesWithAssignments;
          this.cdr.detectChanges();
        });
      } else {
        this.dataSource.data = [];
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  toggleCourse(course: CourseWithAssignments) {
    if (this.expandedCourse === course) {
      this.expandedCourse = null;
      course.expanded = false;
    } else {
      if (this.expandedCourse) {
        this.expandedCourse.expanded = false;
      }
      this.expandedCourse = course;
      course.expanded = true;
    }
  }

  addAssignment(courseId: number) {
    this.router.navigate(['/assignments/create'], { queryParams: { courseId } });
  }

  viewAssignment(assignmentId: number) {
    this.router.navigate(['/assignments', assignmentId]);
  }

  editAssignment(assignmentId: number) {
    this.router.navigate(['/assignments', assignmentId, 'edit']);
  }

  deleteAssignment(assignmentId: number, courseId: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Assignment',
        message: 'Are you sure you want to delete this assignment? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.assignmentService.delete(assignmentId).subscribe({
          next: () => {
            // Reload assignments for this course
            const course = this.dataSource.data.find(c => c.id === courseId);
            if (course) {
              this.assignmentService.getByCourse(courseId).subscribe(assignments => {
                course.assignments = assignments;
                course.totalAssignments = assignments.length;
                this.cdr.detectChanges();
              });
            }
          },
          error: (err) => console.error('Error deleting assignment', err)
        });
      }
    });
  }

  viewSubmissions(assignmentId: number) {
    this.router.navigate(['/submissions'], { queryParams: { assignmentId } });
  }
}
