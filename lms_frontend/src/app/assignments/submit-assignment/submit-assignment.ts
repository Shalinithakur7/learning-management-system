import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AssignmentService } from '../assignment.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-submit-assignment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './submit-assignment.html'
})
export class SubmitAssignmentComponent {
  form;

  constructor(
    private fb: FormBuilder,
    private service: AssignmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      assignmentId: [Number(this.route.snapshot.paramMap.get('id'))],
      filePath: ['', Validators.required]
    });
  }

  submit() {
    this.service.submit(this.form.value).subscribe(() => {
      this.router.navigate(['/assignments']);
    });
  }
}
