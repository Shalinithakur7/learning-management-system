import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table'; // Added MatTableModule
import { MatSort, MatSortModule } from '@angular/material/sort'; // Added MatSortModule
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'; // Added MatPaginatorModule
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReportsService, CourseEnrollmentReportDto } from '../reports.service';

@Component({
    selector: 'app-enrollment-report',
    templateUrl: './enrollment-report.component.html',
    styleUrls: ['./enrollment-report.component.css'],
    standalone: true,
    imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule, MatIconModule]
})
export class EnrollmentReportComponent implements OnInit {
    displayedColumns: string[] = ['courseId', 'courseTitle', 'totalEnrollments'];
    dataSource: MatTableDataSource<CourseEnrollmentReportDto>;
    isLoading = true;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private reportsService: ReportsService) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.reportsService.getEnrollmentStats().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.isLoading = false;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => {
                console.error('Error fetching enrollment stats', err);
                this.isLoading = false;
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
}
