import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { MustMatch } from '../../validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
  ],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  // TODO: IMPLEMENT VALIDATORS AND ERROR HANDLERS

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.email, Validators.required]],
        password: ['', Validators.required],
        password2: ['', Validators.required],
      },
      {
        validator: MustMatch('password', 'password2'),
      }
    );
  }

  onSubmit(): void {
    if (!this.registerForm.valid) {
      // set field errors
      console.log(this.registerForm.valid);
    } else {
      this.authService.register('ADMIN', this.registerForm.value).subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  get name(): any {
    return this.registerForm.get('name');
  }

  get email(): any {
    return this.registerForm.get('email');
  }

  get password(): any {
    return this.registerForm.get('password');
  }

  get password2(): any {
    return this.registerForm.get('password2');
  }

}
