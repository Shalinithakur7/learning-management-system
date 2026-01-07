import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { CourseService, Course, Module, Lesson } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AssignmentService } from '../../assignments/assignment.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

@Component({
    selector: 'app-student-course-details',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatProgressBarModule,
        MatExpansionModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatChipsModule
    ],
    templateUrl: './student-course-details.html',
    styleUrl: './student-course-details.css'
})
export class StudentCourseDetailsComponent implements OnInit {
    courseId: number = 0;
    course: Course | null = null;
    modules: Module[] = [];
    currentLesson: Lesson | null = null;
    completedLessonIds: number[] = [];
    progress: number = 0;
    loading = true;
    error: string | null = null;

    // Assignment Props
    assignments: any[] = [];
    currentAssignment: any | null = null;
    viewMode: 'lesson' | 'assignment' = 'lesson';
    submissionText: string = '';
    isSubmitting: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private courseService: CourseService,
        private enrollmentService: EnrollmentService,
        private assignmentService: AssignmentService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.courseId = +params['id']; // Convert to number
            if (this.courseId) {
                this.loadCourseDetails();
            }
        });
    }

    loadCourseDetails() {
        this.loading = true;
        this.error = null;

        this.courseService.getCourseById(this.courseId).subscribe({
            next: (course) => {
                this.course = course;
                this.modules = course.modules || [];

                // Auto-select first lesson
                if (this.modules.length > 0 && this.modules[0].lessons.length > 0) {
                    this.currentLesson = this.modules[0].lessons[0];
                }

                this.enrollmentService.getEnrollmentStatus(this.courseId.toString()).subscribe(enrollment => {
                    if (enrollment && enrollment.completedLessonIds) {
                        this.completedLessonIds = enrollment.completedLessonIds;
                        this.calculateProgress();
                    }
                    this.cdr.detectChanges();
                });

                // Load Assignments and Submissions
                forkJoin({
                    assignments: this.assignmentService.getByCourse(this.courseId),
                    submissions: this.assignmentService.mySubmissions()
                }).subscribe({
                    next: ({ assignments, submissions }) => {
                        this.assignments = assignments.map((a: any) => {
                            const sub = submissions.find((s: any) => s.assignmentId === a.id);
                            return {
                                ...a,
                                submissionStatus: sub ? (sub.status || 'Submitted') : 'Pending',
                                submission: sub
                            };
                        });
                        this.cdr.detectChanges();
                    },
                    error: (err) => console.error('Error loading assignments', err)
                });

                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading course details', err);
                this.error = 'Failed to load course details. Please try again later.';
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    selectLesson(lesson: Lesson) {
        this.currentLesson = lesson;
        this.currentAssignment = null;
        this.viewMode = 'lesson';
    }

    selectAssignment(assignment: any) {
        this.currentAssignment = assignment;
        this.currentLesson = null;
        this.viewMode = 'assignment';

        // Pre-fill submission if exists?
        // this.submissionText = assignment.submission?.content || ''; 
    }

    submitAssignment() {
        if (!this.currentAssignment || !this.submissionText.trim()) return;

        this.isSubmitting = true;
        const payload = {
            assignmentId: this.currentAssignment.id,
            content: this.submissionText
        };

        this.assignmentService.submit(payload).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                this.currentAssignment.submissionStatus = 'Submitted';
                this.currentAssignment.submission = res;
                this.submissionText = ''; // Clear after submit
                alert('Assignment submitted successfully!');
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Submission failed', err);
                this.isSubmitting = false;
                alert('Failed to submit assignment.');
            }
        });
    }

    isLessonCompleted(lessonId: number): boolean {
        return this.completedLessonIds.includes(lessonId);
    }

    completeLesson() {
        if (this.currentLesson && !this.isLessonCompleted(this.currentLesson.id)) {
            this.completedLessonIds.push(this.currentLesson.id);
            this.calculateProgress();

            this.enrollmentService.completeLesson(this.courseId, this.currentLesson.id).subscribe({
                error: (err) => console.error('Failed to save progress', err)
            });
        }
    }

    calculateProgress() {
        const totalLessons = this.modules.reduce((acc, m) => acc + m.lessons.length, 0);
        if (totalLessons > 0) {
            this.progress = Math.round((this.completedLessonIds.length / totalLessons) * 100);
        }
    }

    hasPreviousLesson(): boolean {
        // Simple check - can be improved
        return false;
    }

    hasNextLesson(): boolean {
        // Simple check - can be improved
        return true;
    }

    previousLesson() {
        // Logic to find previous lesson
    }

    nextLesson() {
        // Logic to find next lesson
    }
}
