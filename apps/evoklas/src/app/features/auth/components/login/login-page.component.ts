import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'apps/evoklas/src/app/core/auth/services/auth.service';
import { TokenStorageService } from 'apps/evoklas/src/app/core/auth/services/token-storage.service';
import { APP_ENV } from 'apps/evoklas/src/app/core/config/environment.tokens';
import { RecaptchaService } from 'apps/evoklas/src/app/core/recaptcha/recaptcha.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DialogModule,
    RippleModule,
    RouterLink,
    ToastModule,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  providers: [MessageService],
})
export class LoginPageComponent implements OnInit {
  private readonly fb = new FormBuilder();
  private readonly recaptcha = inject(RecaptchaService);
  private readonly env = inject(APP_ENV);
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  @Output() loginSubmit = new EventEmitter<{
    email: string;
    password: string;
    recaptchaToken?: string;
  }>();

  submitting = false;
  resetting = false;
  roles: string[] = [];
  returnUrl = '/';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  resetForm = this.fb.group({
    emailReset: ['', [Validators.required, Validators.email]],
  });

  displayResetEmail = false;

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get emailReset() {
    return this.resetForm.get('emailReset');
  }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser()?.roles ?? [];
    }
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl']?.toString() ?? '/';
  }

  onSubmit(): void {
    this.submit();
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const creds = this.loginForm.getRawValue();

    const login = (token?: string) => {
      this.submitting = true;
      this.authService
        .login(creds.email ?? '', creds.password ?? '', token)
        .subscribe({
          next: () => {
            this.roles = this.tokenStorage.getUser()?.roles ?? [];
            this.loginSubmit.emit({
              email: creds.email ?? '',
              password: creds.password ?? '',
              recaptchaToken: token,
            });
            this.router.navigateByUrl(this.returnUrl);
            this.submitting = false;
          },
          error: (err) => {
            if (err?.error?.message === 'Invalid Password!') {
              this.password?.setErrors({ incorrect: true });
              this.password?.markAsTouched();
              this.password?.updateValueAndValidity();
            }
            this.submitting = false;
          },
        });
    };

    const siteKey = this.env.recaptchaSiteKey;
    if (!siteKey) {
      this.submitting = false;
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('APP.ERRORS.0.title'),
        detail: this.translate.instant('APP.ERRORS.0.message'),
      });
      return;
    }

    this.recaptcha.execute('login').subscribe({
      next: (token) => login(token),
      error: (error) => {
        console.error('Recaptcha error:', error);
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('APP.ERRORS.0.title'),
          detail: this.translate.instant('APP.ERRORS.0.message'),
        });
      },
    });
  }

  openResetPasswordDialog(): void {
    this.displayResetEmail = true;
    this.resetForm.reset();
  }

  resetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const { emailReset } = this.resetForm.getRawValue();
    const email = emailReset ?? '';

    const showSuccess = (res: any) => {
      this.messageService.add({
        severity: 'success',
        summary:
          res?.title ||
          this.translate.instant('APP.SUCCESS.RESET_PASSWORD_TITLE'),
        detail:
          res?.message || this.translate.instant('APP.SUCCESS.RESET_PASSWORD'),
      });
    };

    const requestReset = (token?: string) => {
      this.resetting = true;
      this.authService
        .requestPasswordRecovery({ email }, token ?? '')
        .subscribe({
          next: (res) => {
            showSuccess(res);
            this.displayResetEmail = false;
            this.resetting = false;
          },
          error: () => {
            this.resetting = false;
          },
        });
    };

    const siteKey = this.env.recaptchaSiteKey;
    if (!siteKey) {
      this.resetting = false;
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('APP.ERRORS.0.title'),
        detail: this.translate.instant('APP.ERRORS.0.message'),
      });
      return;
    }

    this.recaptcha.execute('resetPassword').subscribe({
      next: (token) => requestReset(token),
      error: (err) => {
        console.error('Recaptcha error:', err);
        this.resetting = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('APP.ERRORS.0.title'),
          detail: this.translate.instant('APP.ERRORS.0.message'),
        });
      },
    });
  }
}
