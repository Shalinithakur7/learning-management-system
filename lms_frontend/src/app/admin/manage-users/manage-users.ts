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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { UserManagementService, UserManagementDto } from '../user-management.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { RoleChangeDialogComponent } from '../../shared/role-change-dialog/role-change-dialog.component';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.css',
})
export class ManageUsers implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['fullName', 'email', 'requestedRole', 'currentRole', 'status', 'actions'];
  dataSource: MatTableDataSource<UserManagementDto>;

  statusFilter = 'All';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userManagementService: UserManagementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.loadUsers();

    // Check for query params (from dashboard navigation)
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.statusFilter = params['status'];
        this.applyFilters();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    console.log('Loading users from API...');
    this.userManagementService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Successfully loaded users from API:', users);
        console.log('Number of real users:', users.length);

        // Merge real users with dummy users
        const dummyUsers = this.generateDummyUsers();
        console.log('Number of dummy users:', dummyUsers.length);

        this.dataSource.data = [...users, ...dummyUsers];
        console.log('Total users in table:', this.dataSource.data.length);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading users from API:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);

        // Fallback to dummy data
        console.log('Falling back to dummy data only');
        this.dataSource.data = this.generateDummyUsers();
        this.cdr.detectChanges();
      }
    });
  }

  generateDummyUsers(): UserManagementDto[] {
    return [
      // PENDING user: has requestedRole, currentRole is PENDING
      { id: 'dummy1', fullName: 'John Pending', email: 'john@example.com', requestedRole: 'INSTRUCTOR', currentRole: 'PENDING', status: 'Pending', rejectionReason: null },

      // ACTIVE users: requestedRole is null, currentRole shows actual role
      { id: 'dummy2', fullName: 'Jane Student', email: 'jane@example.com', requestedRole: null, currentRole: 'STUDENT', status: 'Active', rejectionReason: null },
      { id: 'dummy3', fullName: 'Bob Instructor', email: 'bob@example.com', requestedRole: null, currentRole: 'INSTRUCTOR', status: 'Active', rejectionReason: null },

      // REJECTED user: has requestedRole, currentRole stays PENDING
      { id: 'dummy4', fullName: 'Alice Rejected', email: 'alice@example.com', requestedRole: 'STUDENT', currentRole: 'PENDING', status: 'Rejected', rejectionReason: 'Incomplete information' },

      // BLOCKED user: requestedRole is null, currentRole shows role before blocking
      { id: 'dummy5', fullName: 'Charlie Blocked', email: 'charlie@example.com', requestedRole: null, currentRole: 'INSTRUCTOR', status: 'Blocked', rejectionReason: null }
    ];
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyStatusFilter() {
    this.applyFilters();
  }

  applyFilters() {
    this.dataSource.filterPredicate = (data: UserManagementDto, filter: string) => {
      const statusMatch = this.statusFilter === 'All' || data.status === this.statusFilter;
      const searchMatch = filter === '' ||
        data.fullName.toLowerCase().includes(filter) ||
        data.email.toLowerCase().includes(filter);
      return statusMatch && searchMatch;
    };
    this.dataSource.filter = this.dataSource.filter || ' ';
  }

  approveUser(user: UserManagementDto) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Approve User',
        message: `Approve ${user.fullName} and assign role: ${user.requestedRole}?`,
        confirmText: 'Approve'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userManagementService.approveUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User approved successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err: any) => {
            console.error('Error approving user', err);
            this.snackBar.open('Error approving user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  rejectUser(user: UserManagementDto) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.fullName}?`,
        confirmText: 'Delete'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userManagementService.rejectUser(user.id, 'Rejected by admin').subscribe({
          next: () => {
            this.snackBar.open('User deleted', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err: any) => {
            console.error('Error deleting user', err);
            this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  changeUserRole(user: UserManagementDto) {
    const dialogRef = this.dialog.open(RoleChangeDialogComponent, {
      width: '400px',
      data: {
        userName: user.fullName,
        currentRole: user.currentRole
      }
    });

    dialogRef.afterClosed().subscribe(newRole => {
      if (newRole && newRole !== user.currentRole) {
        this.userManagementService.changeUserRole(user.id, newRole).subscribe({
          next: () => {
            this.snackBar.open(`Role changed to ${newRole} successfully`, 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err: any) => {
            console.error('Error changing role', err);
            this.snackBar.open('Error changing role', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  toggleBlockStatus(user: UserManagementDto) {
    const isBlocking = user.status !== 'Blocked';
    const action = isBlocking ? 'block' : 'unblock';

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: `${isBlocking ? 'Block' : 'Unblock'} User`,
        message: `Are you sure you want to ${action} ${user.fullName}?`,
        confirmText: isBlocking ? 'Block' : 'Unblock',
        confirmColor: isBlocking ? 'warn' : 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const serviceCall = isBlocking ?
          this.userManagementService.blockUser(user.id) :
          this.userManagementService.unblockUser(user.id);

        serviceCall.subscribe({
          next: () => {
            this.snackBar.open(`User ${action}ed successfully`, 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err: any) => {
            console.error(`Error ${action}ing user`, err);
            this.snackBar.open(`Error ${action}ing user`, 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
