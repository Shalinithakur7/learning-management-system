import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ReportService } from '../../reports/report.service';

@Component({
    selector: 'app-submissions-list',
    standalone: true,
    imports: [CommonModule, RouterModule, MatTableModule, MatButtonModule, MatCardModule, MatIconModule],
    template: `
    <div class="container">
      <h2>Pending Submissions</h2>
      <mat-card>
        <table mat-table [dataSource]="submissions" class="mat-elevation-z0">
           <!-- Columns will match dashboard recent submissions but fuller -->
           <ng-container matColumnDef="student">
             <th mat-header-cell *matHeaderCellDef>Student</th>
             <td mat-cell *matCellDef="let s">{{s.studentName}}</td>
           </ng-container>
           <ng-container matColumnDef="assignment">
             <th mat-header-cell *matHeaderCellDef>Assignment</th>
             <td mat-cell *matCellDef="let s">{{s.assignmentTitle}}</td>
           </ng-container>
           <ng-container matColumnDef="date">
             <th mat-header-cell *matHeaderCellDef>Date</th>
             <td mat-cell *matCellDef="let s">{{s.submittedOn | date}}</td>
           </ng-container>
           <ng-container matColumnDef="action">
             <th mat-header-cell *matHeaderCellDef>Action</th>
             <td mat-cell *matCellDef="let s">
               <button mat-button color="primary">Grade</button>
             </td>
           </ng-container>
           <tr mat-header-row *matHeaderRowDef="['student', 'assignment', 'date', 'action']"></tr>
           <tr mat-row *matRowDef="let row; columns: ['student', 'assignment', 'date', 'action']"></tr>
        </table>
      </mat-card>
    </div>
  `,
    styles: [`
    .container { padding: 24px; }
    table { width: 100%; }
  `]
})
export class SubmissionsListComponent implements OnInit {
    submissions: any[] = [];

    constructor(private reportService: ReportService) { }

    ngOnInit() {
        this.reportService.instructorDashboard().subscribe(data => {
            // Reusing dashboard DTO for now, ideally specific endpoint
            this.submissions = data.recentSubmissions || [];
        });
    }
}
