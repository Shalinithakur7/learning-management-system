import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReportsService, StudentCourseGroupDto } from '../reports.service';

@Component({
    selector: 'app-students-by-course',
    templateUrl: './students-by-course.component.html',
    styleUrls: ['./students-by-course.component.css'],
    standalone: true,
    imports: [CommonModule, MatExpansionModule, MatListModule, MatIconModule, MatProgressBarModule]
})
export class StudentsByCourseComponent implements OnInit {
    courseGroups: StudentCourseGroupDto[] = [];
    isLoading = true;

    constructor(private reportsService: ReportsService) { }

    ngOnInit(): void {
        this.reportsService.getStudentsByCourse().subscribe({
            next: (data) => {
                this.courseGroups = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching student groups', err);
                this.isLoading = false;
            }
        });

    }
}
