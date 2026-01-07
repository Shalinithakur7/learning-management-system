import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AdminService } from '../admin.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { RejectDialogComponent } from '../reject-dialog/reject-dialog.component';

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './manage-courses.html',
  styleUrl: './manage-courses.css',
})
export class ManageCourses implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'instructor', 'category', 'level', 'status', 'enrolledCount', 'createdOn', 'actions'];
  dataSource: MatTableDataSource<any>;

  statusFilter = 'All';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.loadCourses();

    // Check for query params (from dashboard navigation)
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.statusFilter = params['status'];
        this.applyStatusFilter();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCourses() {
    // Always generate dummy courses first
    const dummyCourses = this.generateDummyCourses();

    this.adminService.getAllCourses().subscribe({
      next: (courses) => {
        console.log('Generated dummy courses:', dummyCourses.length);

        // Map real courses to match table structure and normalize status
        const mappedRealCourses = courses.map((c: any) => {
          console.log('Backend course:', c.title, 'Raw status:', c.status, 'Type:', typeof c.status);
          const normalized = this.normalizeStatus(c.status);
          console.log('Normalized to:', normalized);

          return {
            ...c,
            instructorName: c.instructorId || 'Unknown Instructor',
            enrolledCount: 0,
            level: 'Beginner',
            category: 'General',
            status: normalized,
            createdOn: c.createdAt ? new Date(c.createdAt) : new Date()
          };
        });

        console.log('Real courses:', mappedRealCourses.length, 'Dummy courses:', dummyCourses.length);
        this.dataSource.data = [...mappedRealCourses, ...dummyCourses];
        console.log('Total courses in table:', this.dataSource.data.length);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading courses', err);
        // Still show dummy data even on error
        console.log('Showing dummy courses due to error');
        this.dataSource.data = dummyCourses;
        this.cdr.detectChanges();
      }
    });
  }

  normalizeStatus(status: string): string {
    // Normalize various backend status formats to match our filter options
    if (!status) {
      console.log('Status is null/undefined, defaulting to Draft');
      return 'Draft';
    }

    const normalized = status.toString().trim().toLowerCase();
    console.log('Normalizing:', status, '->', normalized);

    // Handle enum-style statuses from backend (case-insensitive)
    const statusMap: { [key: string]: string } = {
      'draft': 'Draft',
      'pending': 'Pending',
      'pendingapproval': 'Pending',
      'pending_approval': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };

    const result = statusMap[normalized] || status; // Fallback to original if not found
    console.log('Final status:', result);
    return result;
  }

  generateDummyCourses() {
    // Only Pending courses (submitted for approval)
    const courses = [
      { id: 1001, title: 'Course 1', instructorName: 'Instructor 1', category: 'Mathematics', level: 'Intermediate', status: 'Pending', enrolledCount: 15, createdOn: new Date(2024, 0, 22) },
      { id: 1002, title: 'Course 4', instructorName: 'Instructor 4', category: 'Programming', level: 'Advanced', status: 'Pending', enrolledCount: 7, createdOn: new Date(2024, 4, 21) },
      { id: 1003, title: 'Course 11', instructorName: 'Instructor 11', category: 'Business', level: 'Beginner', status: 'Pending', enrolledCount: 18, createdOn: new Date(2024, 3, 9) },
      { id: 1004, title: 'Course 12', instructorName: 'Instructor 12', category: 'Design', level: 'Advanced', status: 'Pending', enrolledCount: 58, createdOn: new Date(2024, 6, 18) },
      { id: 1005, title: 'Course 15', instructorName: 'Instructor 15', category: 'Programming', level: 'Advanced', status: 'Pending', enrolledCount: 75, createdOn: new Date(2024, 0, 6) }
    ];
    return courses;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyStatusFilter() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const statusMatch = this.statusFilter === 'All' || data.status === this.statusFilter;
      const searchMatch = filter === '' || data.title.toLowerCase().includes(filter);
      return statusMatch && searchMatch;
    };
    this.dataSource.filter = this.dataSource.filter || ' ';
  }

  approveCourse(course: any) {
    this.adminService.approveCourse(course.id).subscribe({
      next: () => {
        // Reload the entire course list to ensure approved course is removed from Pending view
        this.loadCourses();
      },
      error: (err) => {
        console.error('Error approving course', err);
        // Still reload to sync with backend state
        this.loadCourses();
      }
    });
  }

  rejectCourse(course: any) {
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '500px',
      data: {
        courseTitle: course.title
      }
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        // Reason provided, proceed with rejection
        this.adminService.rejectCourse(course.id, reason).subscribe({
          next: () => {
            // Reload the entire course list to ensure rejected course is removed from Pending view
            this.loadCourses();
          },
          error: (err) => {
            console.error('Error rejecting course', err);
            // Still reload to sync with backend state
            this.loadCourses();
          }
        });
      }
    });
  }

  deleteCourse(course: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Course',
        message: `Are you sure you want to delete "${course.title}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.archiveCourse(course.id).subscribe({
          next: () => {
            // Remove from table
            this.dataSource.data = this.dataSource.data.filter(c => c.id !== course.id);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error deleting course', err);
            // For demo, delete anyway
            this.dataSource.data = this.dataSource.data.filter(c => c.id !== course.id);
            this.cdr.detectChanges();
          }
        });
      }
    });
  }
}
