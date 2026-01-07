import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReportsService, AssignmentSubmissionReportDto } from '../reports.service';

@Component({
    selector: 'app-submission-report',
    templateUrl: './submission-report.component.html',
    styleUrls: ['./submission-report.component.css'],
    standalone: true,
    imports: [CommonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCardModule, MatIconModule]
})
export class SubmissionReportComponent implements OnInit {
    displayedColumns: string[] = ['assignmentTitle', 'courseTitle', 'totalSubmissions', 'totalStudents', 'pendingSubmissions'];
    dataSource: MatTableDataSource<AssignmentSubmissionReportDto>;
    isLoading = true;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private reportsService: ReportsService) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.reportsService.getSubmissionStats().subscribe({
            next: (data) => {
                this.dataSource.data = data;
                this.isLoading = false;
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error: (err) => {
                console.error('Error fetching submission stats', err);
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
