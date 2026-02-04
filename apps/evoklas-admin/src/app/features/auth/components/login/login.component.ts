import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { TokenStorageService } from '../../../../core/auth/services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    RippleModule,
  ],
})
export class LoginComponent implements OnInit {
  @ViewChild('passwordInput') passwordEl!: ElementRef;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  roles: string[] = [];
  returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private tokenStorage: TokenStorageService
  ) {}

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser()?.roles ?? [];
    }
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl']?.toString() ?? '/';
  }

  onSubmit(): void {
    const { email, password } = this.formValue;

    if (!email || !password) {
      if (!email) {
        this.email?.setErrors({ invalid: true });
      }

      if (!password) {
        this.password?.setErrors({ invalid: true });
      }

      this.loginForm.updateValueAndValidity();
    } else {
      this.authService.login(email, password).subscribe(
        () => {
          this.roles = this.tokenStorage.getUser()?.roles ?? [];
          this.router.navigateByUrl(this.returnUrl);
        },
        (err) => {
          console.log('Failed to authenticate', err);
          if (err.error.message === 'Invalid Password!') {
            this.password?.setErrors({ incorrect: true });
            this.password?.updateValueAndValidity();
          }
        }
      );
    }
  }

  get formValue(): any {
    return this.loginForm.value;
  }

  get email(): any {
    return this.loginForm.get('email');
  }

  get password(): any {
    return this.loginForm.get('password');
  }

  reloadPage(): void {
    window.location.reload();
  }
}
