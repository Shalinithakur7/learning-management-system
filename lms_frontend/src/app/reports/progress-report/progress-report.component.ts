import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReportsService, StudentProgressReportDto } from '../reports.service';

@Component({
    selector: 'app-progress-report',
    templateUrl: './progress-report.component.html',
    styleUrls: ['./progress-report.component.css'],
    standalone: true,
    imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule, MatIconModule, MatProgressBarModule]
})
export class ProgressReportComponent implements OnInit {
    displayedColumns: string[] = ['studentName', 'courseTitle', 'completedLessons', 'progressPercentage'];
    dataSource: MatTableDataSource<StudentProgressReportDto>;
    isLoading = true;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private reportsService: ReportsService) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.reportsService.getStudentProgress().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.isLoading = false;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => {
                console.error('Error fetching progress reports', err);
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
