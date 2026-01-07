import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../core/auth/auth';
import { CourseService } from '../course.service';
import { EnrollmentService } from '../../enrollment/enrollment.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  templateUrl: './my-courses.html',
  styleUrls: ['./my-courses.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTooltipModule
  ]
})
export class MyCoursesComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'title', 'price', 'status', 'actions'];
  rejectedColumns: string[] = ['id', 'title', 'status', 'rejectionReason', 'actions'];
  dataSource: MatTableDataSource<any>;
  role: string | null = null;

  // Tab state management
  selectedTabIndex = 0;
  allCourses: any[] = [];
  draftCount = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private auth: AuthService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.role = this.auth.getRole();
    this.dataSource = new MatTableDataSource();
    this.loadCourses();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCourses() {
    if (this.role === 'Instructor') {
      this.courseService.getMyCourses().subscribe(res => {
        // 1. Dictionary of Dummy Courses
        const dummyCourses = [
          { id: 101, title: 'Angular Basics', price: 49.99, description: 'Learn Angular from scratch', status: 'Approved', classification: 'Development' },
          { id: 102, title: 'React Advanced', price: 59.99, description: 'Master React patterns', status: 'Pending', classification: 'Development' },
          { id: 103, title: 'Python for Data Science', price: 39.99, description: 'Data analysis with Python', status: 'Draft', classification: 'Data Science' },
          { id: 104, title: 'Rejected Course Example', price: 0, description: 'This course was rejected', status: 'Rejected', rejectionReason: 'Content too short', classification: 'Business' }
        ];

        // 2. Map Real Courses
        const realCourses = res.map(course => ({
          ...course,
          status: this.mapCourseStatus(course)
        }));

        // 3. Merge: Real courses first, then Dummy
        this.allCourses = [...realCourses, ...dummyCourses];

        this.updateTabCounts();
        this.filterByTab(this.selectedTabIndex);
        this.cdr.detectChanges();
      });
    } else {
      this.enrollmentService.myEnrollments().subscribe(res => {
        this.dataSource.data = res;
        this.cdr.detectChanges();
      });
    }
  }

  mapCourseStatus(course: any): string {
    // If backend provides status field, use it
    if (course.status) {
      // Map backend status to display names
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
    // Fallback to isPublished for backward compatibility
    return course.isPublished ? 'Approved' : 'Draft';
  }

  updateTabCounts() {
    this.draftCount = this.allCourses.filter(c => c.status === 'Draft').length;
    this.pendingCount = this.allCourses.filter(c => c.status === 'Pending').length;
    this.approvedCount = this.allCourses.filter(c => c.status === 'Approved').length;
    this.rejectedCount = this.allCourses.filter(c => c.status === 'Rejected').length;
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    this.filterByTab(index);
  }

  filterByTab(index: number) {
    let filtered: any[] = [];
    switch (index) {
      case 0: // Draft
        filtered = this.allCourses.filter(c => c.status === 'Draft');
        break;
      case 1: // Pending
        filtered = this.allCourses.filter(c => c.status === 'Pending');
        break;
      case 2: // Approved
        filtered = this.allCourses.filter(c => c.status === 'Approved');
        break;
      case 3: // Rejected
        filtered = this.allCourses.filter(c => c.status === 'Rejected');
        break;
    }
    this.dataSource.data = filtered;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteCourse(id: number) {
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
            const data = this.dataSource.data.filter(c => c.id !== id);
            this.dataSource.data = data; // Update data source to refresh table
            this.loadCourses(); // Reload to update counts
          },
          error: (err) => console.error('Error deleting course', err)
        });
      }
    });
  }

  resubmitCourse(id: number) {
    this.courseService.submitForApproval(id).subscribe({
      next: () => {
        this.loadCourses(); // Reload to update list and move to Pending
      },
      error: (err) => console.error('Error resubmitting course', err)
    });
  }
}
