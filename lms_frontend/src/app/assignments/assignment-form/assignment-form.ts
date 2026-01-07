import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { AssignmentService } from '../assignment.service';
import { CourseService } from '../../courses/course.service';

@Component({
    selector: 'app-assignment-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatRadioModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatIconModule
    ],
    templateUrl: './assignment-form.html',
    styleUrls: ['./assignment-form.css']
})
export class AssignmentFormComponent implements OnInit {
    assignmentForm: FormGroup;
    courses: any[] = [];
    isEditMode = false;
    assignmentId: number | null = null;
    loading = false;

    constructor(
        private fb: FormBuilder,
        private assignmentService: AssignmentService,
        private courseService: CourseService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.assignmentForm = this.fb.group({
            courseId: ['', Validators.required],
            title: ['', Validators.required],
            description: ['', Validators.required],
            dueDate: ['', Validators.required],
            maxMarks: ['', [Validators.required, Validators.min(1)]],
            submissionType: ['File', Validators.required],
            allowLateSubmission: [false],
            instructions: [''],
            isPublished: [false]
        });
    }

    ngOnInit() {
        // Load instructor's courses
        this.courseService.getMyCourses().subscribe(courses => {
            this.courses = courses;
        });

        // Check if courseId is provided in query params (from "Add Assignment" button)
        this.route.queryParams.subscribe(params => {
            if (params['courseId']) {
                this.assignmentForm.patchValue({ courseId: +params['courseId'] });
            }
        });

        // Check if we're in edit mode
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.assignmentId = +params['id'];
                this.loadAssignment(this.assignmentId);
            }
        });
    }

    loadAssignment(id: number) {
        this.loading = true;
        this.assignmentService.getById(id).subscribe({
            next: (assignment) => {
                this.assignmentForm.patchValue({
                    courseId: assignment.courseId,
                    title: assignment.title,
                    description: assignment.description,
                    dueDate: new Date(assignment.dueDate),
                    maxMarks: assignment.maxMarks,
                    submissionType: assignment.submissionType,
                    allowLateSubmission: assignment.allowLateSubmission,
                    instructions: assignment.instructions,
                    isPublished: assignment.isPublished
                });
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading assignment', err);
                this.loading = false;
            }
        });
    }

    saveAsDraft() {
        if (this.assignmentForm.valid) {
            const formData = {
                ...this.assignmentForm.value,
                isPublished: false
            };
            this.saveAssignment(formData);
        }
    }

    publishAssignment() {
        if (this.assignmentForm.valid) {
            const formData = {
                ...this.assignmentForm.value,
                isPublished: true
            };
            this.saveAssignment(formData);
        }
    }

    saveAssignment(data: any) {
        this.loading = true;

        if (this.isEditMode && this.assignmentId) {
            this.assignmentService.update(this.assignmentId, data).subscribe({
                next: () => {
                    this.loading = false;
                    this.router.navigate(['/assignments']);
                },
                error: (err) => {
                    console.error('Error updating assignment', err);
                    this.loading = false;
                }
            });
        } else {
            this.assignmentService.create(data).subscribe({
                next: () => {
                    this.loading = false;
                    this.router.navigate(['/assignments']);
                },
                error: (err) => {
                    console.error('Error creating assignment', err);
                    this.loading = false;
                }
            });
        }
    }

    cancel() {
        this.router.navigate(['/assignments']);
    }
}
