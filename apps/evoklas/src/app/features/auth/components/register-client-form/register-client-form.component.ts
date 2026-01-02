import { Component, OnInit, Input, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';

import { AuthService } from 'apps/evoklas/src/app/core/auth/services/auth.service';
import { APP_ENV, AppEnvironment } from '../../../../core/config/environment.tokens';
import { RecaptchaService } from 'apps/evoklas/src/app/core/recaptcha/recaptcha.service';

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      // return if another validator has already found an error on the matchingControl
      return;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}

@Component({
  selector: 'app-register-client-form',
  templateUrl: './register-client-form.component.html',
  styleUrls: ['./register-client-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    PasswordModule,
  ],
})
export class RegisterClientFormComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  @Input() cities: any = [];

  // TODO: IMPLEMENT VALIDATORS AND ERROR HANDLERS

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private reCaptchaService: RecaptchaService,
    private router: Router,
    @Inject(APP_ENV) private env: AppEnvironment
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', Validators.required],
        surname: ['', Validators.required],
        phone: ['', Validators.required], // TODO: Validators.pattern(ROMANIA_PHONE_PATTERN)
        city: ['', Validators.required],
        email: ['', [Validators.email, Validators.required]],
        password: ['', Validators.required],
        password2: ['', Validators.required],
        termsAndConditions: [false, Validators.requiredTrue],
      },
      {
        validator: MustMatch('password', 'password2'),
      }
    );
  }

  onSubmit(): void {
    if (!this.registerForm.valid) {
      this.setFieldErrors();
    } else {
      const region = this.cities.find(
        (c: any) => c.name === this.city?.value
      )?.id;
      const formValue = { ...this.registerForm.value, city: region };

      const doRegister = (token?: string) => {
        this.authService
          .register('CLIENT', formValue, token ?? '')
          .subscribe((res: any) => {
            this.router.navigate(['/login']);
          });
      };

      if (!this.env.recaptchaSiteKey) {
        console.error('Missing reCAPTCHA site key');
        return;
      }

      this.reCaptchaService.execute('register').subscribe({
        next: (token: string) => doRegister(token),
        error: (error) => console.error('Invalid captchaV3', error),
      });
    }
  }

  get termsAndConditions(): any {
    return this.registerForm.get('termsAndConditions');
  }

  setFieldErrors(): void {
    this.registerForm.markAllAsTouched();
  }

  get name(): any {
    return this.registerForm.get('name');
  }

  get surname(): any {
    return this.registerForm.get('surname');
  }

  get city(): any {
    return this.registerForm.get('city');
  }

  get phone(): any {
    return this.registerForm.get('phone');
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
