import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

export interface RoleChangeDialogData {
    userName: string;
    currentRole: string;
}

@Component({
    selector: 'app-role-change-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule
    ],
    template: `
    <h2 mat-dialog-title>Change User Role</h2>
    <mat-dialog-content>
      <p>Change role for <strong>{{ data.userName }}</strong></p>
      <p>Current role: <strong>{{ data.currentRole }}</strong></p>
      
      <mat-form-field appearance="outline" style="width: 100%; margin-top: 16px;">
        <mat-label>New Role</mat-label>
        <mat-select [(value)]="selectedRole">
          <mat-option value="STUDENT">Student</mat-option>
          <mat-option value="INSTRUCTOR">Instructor</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancel</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="selectedRole" [disabled]="!selectedRole || selectedRole === data.currentRole">
        Change Role
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    mat-dialog-content {
      min-width: 300px;
      padding: 20px 24px;
    }
    p {
      margin: 8px 0;
    }
  `]
})
export class RoleChangeDialogComponent {
    selectedRole: string;

    constructor(
        public dialogRef: MatDialogRef<RoleChangeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: RoleChangeDialogData
    ) {
        // Set initial value to current role
        this.selectedRole = data.currentRole;
    }
}
