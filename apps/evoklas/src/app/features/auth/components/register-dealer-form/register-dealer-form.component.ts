import {
  Component,
  OnInit,
  Input,
  ElementRef,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';

import {
  MustMatch,
  RO_PHONE_PATTERN,
  NAME_PATTERN,
  passwordStrength,
  minSelected,
} from './validators';
import { AuthService } from 'apps/evoklas/src/app/core/auth/services/auth.service';
import { APP_ENV, AppEnvironment } from '../../../../core/config/environment.tokens';
import { RecaptchaService } from 'apps/evoklas/src/app/core/recaptcha/recaptcha.service';

@Component({
  selector: 'app-register-dealer-form',
  templateUrl: './register-dealer-form.component.html',
  styleUrls: ['./register-dealer-form.component.scss'],
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
    MultiSelectModule,
    DialogModule,
  ],
})
export class RegisterDealerFormComponent implements OnInit {
  registerForm!: FormGroup;
  @Input() cities: Array<{ id: number; name: string }> = [];
  @Input() brands: Array<{ id: number; name: string }> = [];
  display = false;
  submitted = false;

  // Optional: collect API errors keyed by field
  apiErrors: Record<string, string> = {};

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private reCaptchaService: RecaptchaService,
    private router: Router,
    private host: ElementRef,
    @Inject(APP_ENV) private env: AppEnvironment
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required, Validators.pattern(NAME_PATTERN)]],
        surname: ['', [Validators.required, Validators.pattern(NAME_PATTERN)]],
        dealerBrands: [[], [Validators.required, minSelected(1)]],
        phone: [
          '',
          [Validators.required, Validators.pattern(RO_PHONE_PATTERN)],
        ],
        city: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [passwordStrength()]],
        password2: ['', [Validators.required]],
        termsAndConditions: [false, Validators.requiredTrue],
      },
      {
        validators: MustMatch('password', 'password2'),
      }
    );
  }

  onSubmit(): void {
    this.submitted = true;
    this.apiErrors = {};

    if (this.registerForm.invalid) {
      this.markAllAsTouchedAndFocusFirstInvalid();
      return;
    }

    const formData: any = { ...this.registerForm.value };

    // Map city name -> id
    const region = this.cities.find((c) => c.name === this.city?.value)?.id;
    formData.city = region;

    // Map brand names -> ids
    if (this.dealerBrands && this.dealerBrands?.value?.length > 0) {
      const dealerBrands = this.brands
        .filter((b) => this.dealerBrands?.value.includes(b.name))
        .map((b) => b.id);
      formData.dealerBrands = dealerBrands;
    }

    const register = (token: string) => {
      this.authService.register('DEALER', formData, token).subscribe({
        next: () => {
          this.display = true;
          setTimeout(() => (this.display = false), 5000);
        },
        error: (err) => {
          // Try to surface field-level errors coming from API
          // Expected shape: { errors: { email: "Already used", phone: "Invalid", ... } }
          if (err?.error?.errors && typeof err.error.errors === 'object') {
            this.applyApiErrors(err.error.errors);
          }
          this.display = false;
        },
      });
    };

    if (!this.env.recaptchaSiteKey) {
      console.error('Missing reCAPTCHA site key');
      return;
    }

    this.reCaptchaService.execute('register').subscribe({
      next: (token) => register(token),
      error: (error) => console.error('Invalid captchaV3', error),
    });
  }

  private markAllAsTouchedAndFocusFirstInvalid(): void {
    this.registerForm.markAllAsTouched();
    // give the UI a tick to render validation classes, then focus
    setTimeout(() => {
      const firstInvalid: HTMLElement | null =
        this.host.nativeElement.querySelector(
          'input.ng-invalid, p-dropdown.ng-invalid, p-multiselect.ng-invalid, p-password.ng-invalid'
        );
      if (firstInvalid) {
        (firstInvalid as HTMLElement).focus?.();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  private applyApiErrors(errors: Record<string, string>): void {
    // Store for display
    this.apiErrors = errors || {};

    // Attach to controls so UI shows invalid state
    Object.entries(this.apiErrors).forEach(([key, message]) => {
      const ctrl = this.registerForm.get(key);
      if (ctrl) {
        ctrl.setErrors({ api: message });
        ctrl.markAsTouched();
      }
    });
  }

  // Convenience getters
  get termsAndConditions(): AbstractControl | null {
    return this.registerForm.get('termsAndConditions');
  }
  get name(): AbstractControl | null {
    return this.registerForm.get('name');
  }
  get surname(): AbstractControl | null {
    return this.registerForm.get('surname');
  }
  get dealerBrands(): AbstractControl | null {
    return this.registerForm.get('dealerBrands');
  }
  get city(): AbstractControl | null {
    return this.registerForm.get('city');
  }
  get phone(): AbstractControl | null {
    return this.registerForm.get('phone');
  }
  get email(): AbstractControl | null {
    return this.registerForm.get('email');
  }
  get password(): AbstractControl | null {
    return this.registerForm.get('password');
  }
  get password2(): AbstractControl | null {
    return this.registerForm.get('password2');
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
