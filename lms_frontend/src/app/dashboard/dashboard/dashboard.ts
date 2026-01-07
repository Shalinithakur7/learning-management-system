import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin, finalize, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth';
import { EnrollmentService } from '../../enrollment/enrollment.service';
import { CourseService } from '../../courses/course.service';
import { AssignmentService } from '../../assignments/assignment.service';
import { ProgressService } from '../../progress/progress.service';
import { ReportService } from '../../reports/report.service';

import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatButtonModule,
    MatTabsModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  role: string | null = null;
  loading = true;

  // Student data
  studentStats = {
    courses: 0,
    assignments: 0,
    completed: 0,
    progress: 0
  };
  studentEnrollments: any[] = [];
  studentProgress: any[] = [];
  studentSubmissions: any[] = [];

  // Instructor data
  instructorStats = {
    courses: 0,
    students: 0,
    assignments: 0,
    pendingSubmissions: 0,
    progress: 0
  };
  instructorCourses: any[] = []; // Keep for My Courses table
  recentSubmissions: any[] = [];

  // Admin data
  adminStats = {
    users: 0,
    courses: 0,
    enrollments: 0,
    pending: 0
  };
  pendingEnrollments: any[] = [];

  displayedColumns = ['course', 'progress', 'status', 'action'];
  instructorCourseColumns = ['title', 'students', 'assignments', 'status', 'action'];
  submissionColumns = ['student', 'course', 'assignment', 'submitted', 'status', 'action'];

  constructor(
    private auth: AuthService,
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private assignmentService: AssignmentService,
    private progressService: ProgressService,
    private reportService: ReportService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    if (this.role === 'Student') {
      this.loadStudentData();
    } else if (this.role === 'Instructor') {
      this.loadInstructorData();
    } else if (this.role === 'Admin') {
      this.loadAdminData();
    } else {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  loadStudentData(): void {
    forkJoin({
      enrollments: this.enrollmentService.myEnrollments().pipe(catchError(() => of([]))),
      progress: this.progressService.myProgress().pipe(catchError(() => of([]))),
      submissions: this.assignmentService.mySubmissions().pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data: any) => {
        // 1. Filter Approved Enrollments
        const allEnrollments = data.enrollments || [];
        this.studentEnrollments = allEnrollments.filter((e: any) => e.status === 'Approved');

        this.studentProgress = data.progress || [];
        this.studentSubmissions = data.submissions || [];

        // 2. Calculate Basic Stats
        this.studentStats.courses = this.studentEnrollments.length;

        // 3. fetch assignments for approved courses to calc pending
        if (this.studentEnrollments.length > 0) {
          const assignmentRequests = this.studentEnrollments.map(e =>
            this.assignmentService.getByCourse(e.courseId).pipe(catchError(() => of([])))
          );

          forkJoin(assignmentRequests).subscribe((assignmentsByCourse: any[]) => {
            let totalPending = 0;
            const allAssignments = assignmentsByCourse.flat();

            allAssignments.forEach(assignment => {
              const sub = this.studentSubmissions.find(s => s.assignmentId === assignment.id);
              if (!sub || sub.status === 'Pending') {
                totalPending++;
              }
            });

            this.studentStats.assignments = totalPending;
            this.cdr.markForCheck();
          });
        } else {
          this.studentStats.assignments = 0;
        }

        // 4. Calculate Progress Stats (Weighted Average)
        let totalCompletedLessons = 0;
        let totalLessons = 0;

        // Only count progress for APPROVED courses
        const approvedCourseIds = this.studentEnrollments.map(e => e.courseId);

        // Map progress to approved courses
        const relevantProgress = this.studentProgress.filter(p => approvedCourseIds.includes(p.courseId));

        relevantProgress.forEach(p => {
          const completed = Number(p.completedLessons) || 0;
          const percentage = Number(p.completionPercentage) || 0;
          let tLessons = Number(p.totalLessons) || 0;

          if (tLessons === 0 && percentage > 0) {
            tLessons = Math.round((completed / percentage) * 100);
          }

          // Failsafe: If we still have 0 total lessons but have completed some, 
          // assume at least the completed ones exist to avoid 0% average when work is done.
          if (tLessons < completed) {
            tLessons = completed;
          }

          totalCompletedLessons += completed;
          totalLessons += tLessons;
        });

        this.studentStats.completed = totalCompletedLessons;
        this.studentStats.progress = totalLessons > 0
          ? Math.round((totalCompletedLessons / totalLessons) * 100)
          : (totalCompletedLessons > 0 ? 100 : 0);
      },
      error: (err) => console.error('Error loading student data', err)
    });
  }

  loadInstructorData(): void {
    // 1. Define Dummy Data
    const dummyStats = {
      courses: 5,
      students: 42,
      assignments: 12,
      pendingSubmissions: 3,
      progress: 75
    };

    const dummyRecentSubmissions = [
      { id: 101, studentName: 'John Doe', courseName: 'Angular Basics', assignmentTitle: 'Assignment 1', submittedAt: new Date(), status: 'Pending' },
      { id: 102, studentName: 'Jane Smith', courseName: 'React Advanced', assignmentTitle: 'Project 2', submittedAt: new Date(), status: 'Graded' }
    ];

    const dummyCourses = [
      { id: 101, title: 'Angular Basics', students: 25, assignments: 5, status: 'Approved' },
      { id: 102, title: 'React Advanced', students: 17, assignments: 7, status: 'Pending' }
    ];

    // Initialize with dummy data first
    this.instructorStats = { ...dummyStats };
    this.recentSubmissions = [...dummyRecentSubmissions];
    this.instructorCourses = [...dummyCourses];

    this.loading = false; // Show data immediately
    this.cdr.detectChanges();

    // 2. Fetch Real Data in Parallel
    forkJoin({
      dashboard: this.reportService.instructorDashboard().pipe(catchError(() => of(null))),
      myCourses: this.courseService.getMyCourses().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data: any) => {
        // --- Process Dashboard Stats ---
        if (data.dashboard) {
          const db = data.dashboard;
          // Add real stats to dummy stats (or just use real if you prefer, but user asked to "show my data along with dummy data" usually implies lists. For stats, summing might be weird, so let's just use the max or sum?)
          // Let's sum them to show "activity"
          this.instructorStats.courses = dummyStats.courses + (db.totalCourses || 0);
          this.instructorStats.students = dummyStats.students + (db.totalStudents || 0);
          this.instructorStats.assignments = dummyStats.assignments + (db.totalAssignments || 0);
          this.instructorStats.pendingSubmissions = dummyStats.pendingSubmissions + (db.pendingSubmissions || 0);
          // Average progress: weighted average or just simple average of the two? Let's just average them.
          this.instructorStats.progress = Math.round((dummyStats.progress + (db.averageProgress || 0)) / 2);

          // Merge Recent Submissions
          if (db.recentSubmissions && db.recentSubmissions.length > 0) {
            this.recentSubmissions = [...db.recentSubmissions, ...dummyRecentSubmissions];
          }
        }

        // --- Process My Courses ---
        if (data.myCourses && data.myCourses.length > 0) {
          const realCourses = data.myCourses.map((c: any) => ({
            ...c,
            // Ensure status logic matches
            status: this.mapCourseStatus(c),
            students: 0, // Real data might not have this yet
            assignments: 0
          }));

          // Merge: Real courses first, then dummy
          this.instructorCourses = [...realCourses, ...dummyCourses];
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading instructor data', err)
    });
  }

  mapCourseStatus(course: any): string {
    if (course.status) {
      const statusMap: any = {
        'Draft': 'Draft',
        'Pending': 'Pending',
        'PendingApproval': 'Pending',
        'Pending_Approval': 'Pending',
        'Approved': 'Approved',
        'Rejected': 'Rejected'
      };
      return statusMap[course.status] || course.status;
    }
    return course.isPublished ? 'Approved' : 'Draft';
  }

  loadAdminData(): void {
    forkJoin({
      courses: this.courseService.getAll().pipe(catchError(() => of([]))),
      pending: this.enrollmentService.pending().pipe(catchError(() => of([]))),
      report: this.reportService.courseEnrollments().pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (data: any) => {
        this.adminStats.courses = (data.courses || []).length;

        const pending = data.pending || [];
        this.pendingEnrollments = pending.slice(0, 5);
        this.adminStats.pending = pending.length;

        const report = data.report || [];
        this.adminStats.enrollments = report.reduce((sum: number, r: any) => sum + r.enrollmentCount, 0);
      }
    });
  }

  getEnrollmentProgress(enrollment: any): number {
    const progress = this.studentProgress.find(p => p.courseId === enrollment.courseId);
    // If no specific progress record, return 0.
    // In a real app, you might want to fetch progress if missing, or cache it.
    return progress?.completionPercentage || 0;
  }

  approveEnrollment(id: number): void {
    this.enrollmentService.approve(id).subscribe({
      next: () => {
        this.loadAdminData();
      }
    });
  }

  deleteCourse(id: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Course',
        message: 'Are you sure you want to delete this course? This cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.courseService.delete(id).subscribe({
          next: () => {
            this.loadInstructorData(); // Reload data
          },
          error: (err) => console.error('Error deleting course', err)
        });
      }
    });
  }
}
