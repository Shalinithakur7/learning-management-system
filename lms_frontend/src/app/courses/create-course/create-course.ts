import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { CourseService } from '../course.service';

@Component({
    selector: 'app-create-course',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        MatStepperModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatDividerModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        MatTooltipModule,
        MatListModule
    ],
    templateUrl: './create-course.html',
    styleUrls: ['./create-course.css']
})
export class CreateCourseComponent {
    courseForm: FormGroup;
    isCreating = false;
    createdCourseId: number | null = null;

    // For Module Management
    modules: any[] = [];

    // For adding a new module
    newModuleTitle = '';

    isEditMode = false;
    courseId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private courseService: CourseService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        this.courseForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.courseId = +params['id'];
                this.createdCourseId = this.courseId; // Set existing ID
                this.loadCourse(this.courseId);
            }
        });
    }

    loadCourse(id: number) {
        this.courseService.getById(id).subscribe({
            next: (course) => {
                this.courseForm.patchValue(course);
                this.modules = course.modules || [];
                // Initialize temp fields for modules
                this.modules.forEach(m => {
                    m.lessons = m.lessons || [];
                    m.newLessonType = 'video';
                });
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Failed to load course details', 'Close');
                this.router.navigate(['/dashboard']);
            }
        });
    }

    createCourse(stepper: any) {
        if (this.courseForm.invalid) return;

        setTimeout(() => this.isCreating = true);
        const courseData = {
            ...this.courseForm.value,
            isPublished: false
        };

        if (this.isEditMode && this.courseId) {
            this.courseService.update(this.courseId, courseData).subscribe({
                next: (course) => {
                    this.isCreating = false;
                    this.snackBar.open('Course Updated Successfully', 'OK', { duration: 2000 });
                    setTimeout(() => stepper.next(), 100);
                },
                error: (err) => {
                    this.isCreating = false;
                    console.error(err);
                    this.snackBar.open('Failed to update course', 'Close');
                }
            });
        } else {
            this.courseService.create(courseData).subscribe({
                next: (course) => {
                    this.createdCourseId = course.id;
                    this.isCreating = false;
                    this.snackBar.open('Course Draft Initialized', 'OK', { duration: 2000 });
                    setTimeout(() => stepper.next(), 100);
                },
                error: (err) => {
                    this.isCreating = false;
                    console.error(err);
                    const errorMessage = err.error?.message || err.statusText || 'Failed to create course.';
                    this.snackBar.open(errorMessage, 'Close', { duration: 3000 });
                }
            });
        }
    }

    addModule() {
        if (!this.createdCourseId || !this.newModuleTitle) return;

        this.courseService.addModule(this.createdCourseId, { title: this.newModuleTitle, courseId: this.createdCourseId })
            .subscribe({
                next: (module) => {
                    this.modules.push({
                        ...module,
                        lessons: [],
                        newLessonTitle: '',
                        newLessonContent: '',
                        newLessonUrl: '',
                        newLessonType: 'video', // Default
                        selectedFile: null
                    });
                    this.newModuleTitle = '';
                    this.snackBar.open('Module Added', 'OK', { duration: 2000 });
                },
                error: (err) => {
                    console.error(err);
                    const msg = err.error?.message || err.statusText || 'Failed to add module';
                    this.snackBar.open(msg, 'Close', { duration: 3000 });
                }
            });
    }

    onFileSelected(event: any, moduleIndex: number) {
        const file = event.target.files[0];
        if (file) {
            this.modules[moduleIndex].selectedFile = file;
            this.modules[moduleIndex].selectedFileName = file.name;
        }
    }

    addLesson(moduleIndex: number) {
        const module = this.modules[moduleIndex];
        if (!module.newLessonTitle) return;

        if (module.selectedFile) {
            // Use Upload Endpoint
            const formData = new FormData();
            formData.append('title', module.newLessonTitle);
            formData.append('content', module.newLessonContent || '');
            formData.append('videoFile', module.selectedFile);

            this.courseService.addLessonWithUpload(module.id, formData).subscribe({
                next: (lesson) => this.handleLessonSuccess(module, lesson),
                error: (err) => {
                    console.error(err);
                    const msg = err.error?.message || err.statusText || 'Failed to upload lesson';
                    this.snackBar.open(msg, 'Close', { duration: 3000 });
                }
            });
        } else {
            // Standard JSON Endpoint (Text or Link)
            const lessonData = {
                title: module.newLessonTitle,
                content: module.newLessonContent,
                videoUrl: module.newLessonUrl || '',
                moduleId: module.id
            };

            this.courseService.addLesson(module.id, lessonData).subscribe({
                next: (lesson) => this.handleLessonSuccess(module, lesson),
                error: (err) => {
                    console.error(err);
                    const msg = err.error?.message || err.statusText || 'Failed to add lesson';
                    this.snackBar.open(msg, 'Close', { duration: 3000 });
                }
            });
        }
    }

    private handleLessonSuccess(module: any, lesson: any) {
        module.lessons.push(lesson);
        module.newLessonTitle = '';
        module.newLessonContent = '';
        module.newLessonUrl = '';
        module.selectedFile = null;
        this.snackBar.open('Lesson Added Successfully', 'OK', { duration: 2000 });
    }

    deleteModule(index: number) {
        const module = this.modules[index];
        if (confirm('Delete this module and all its lessons?')) {
            if (module.id) {
                this.courseService.deleteModule(module.id).subscribe({
                    next: () => {
                        this.modules.splice(index, 1);
                        this.snackBar.open('Module deleted', 'OK', { duration: 2000 });
                    },
                    error: (err) => {
                        console.error(err);
                        this.snackBar.open('Failed to delete module', 'Close');
                    }
                });
            } else {
                this.modules.splice(index, 1);
            }
        }
    }

    deleteLesson(moduleIndex: number, lessonIndex: number) {
        const module = this.modules[moduleIndex];
        const lesson = module.lessons[lessonIndex];
        if (confirm('Delete this lesson?')) {
            if (lesson.id) {
                this.courseService.deleteLesson(lesson.id).subscribe({
                    next: () => {
                        module.lessons.splice(lessonIndex, 1);
                        this.snackBar.open('Lesson deleted', 'OK', { duration: 2000 });
                    },
                    error: (err) => {
                        console.error(err);
                        this.snackBar.open('Failed to delete lesson', 'Close');
                    }
                });
            } else {
                module.lessons.splice(lessonIndex, 1);
            }
        }
    }

    finish() {
        if (this.createdCourseId) {
            // Submit for admin approval instead of direct publish
            this.courseService.submitForApproval(this.createdCourseId).subscribe({
                next: () => {
                    this.snackBar.open('Course sent for admin approval!', 'OK', { duration: 3000 });
                    this.router.navigate(['/courses/my']);
                },
                error: (err: any) => {
                    console.error(err);
                    this.snackBar.open('Failed to submit course for approval', 'Close');
                }
            });
        } else {
            this.router.navigate(['/courses/my']);
        }
    }
}
