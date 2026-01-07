import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-reject-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule
    ],
    template: `
    <h2 mat-dialog-title>Reject Course</h2>
    <mat-dialog-content>
      <p>Please provide a reason for rejecting "{{data.courseTitle}}":</p>
      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Rejection Reason</mat-label>
        <textarea matInput [(ngModel)]="reason" rows="4" 
                  placeholder="Ex. Course content does not meet quality standards..."
                  required></textarea>
      </mat-form-field>
      <p style="font-size: 12px; color: #666;">This message will be sent to the instructor.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onReject()" [disabled]="!reason || reason.trim().length === 0">
        Reject Course
      </button>
    </mat-dialog-actions>
  `
})
export class RejectDialogComponent {
    reason: string = '';

    constructor(
        public dialogRef: MatDialogRef<RejectDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { courseTitle: string }
    ) { }

    onCancel(): void {
        this.dialogRef.close();
    }

    onReject(): void {
        this.dialogRef.close(this.reason);
    }
}
