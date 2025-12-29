import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import { User } from '../models/user.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenStorage: TokenStorageService
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      tokenStorage.getUser()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string, token?: string): Observable<any> {
    return this.http
      .post(
        `/api/auth/signin`,
        {
          email,
          password,
          token,
        },
        httpOptions
      )
      .pipe(
        map((user: any) => {
          this.tokenStorage.saveToken(user.accessToken);
          this.tokenStorage.saveUser(user);
          this.currentUserSubject.next(user);
        })
      );
  }

  public updateUser(reqLimit: any): void {
    let user = this.tokenStorage.getUser();
    user = {
      ...user,
      requestsLimit: reqLimit,
    };
    this.tokenStorage.saveUser(user);
    this.currentUserSubject.next(user);
  }

  register(
    role: string,
    registrationData: any,
    token?: string
  ): Observable<any> {
    registrationData = {
      ...registrationData,
      role,
      token,
    };
    return this.http.post(
      `/api/auth/signup`,
      {
        ...registrationData,
      },
      httpOptions
    );
  }

  checkEmail(email: string): Observable<any> {
    return this.http.get(`/api/auth/checkEmail?email=${email}`);
  }

  logout(): void {
    this.router.navigate(['/']);
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null);
  }

  public updateEditedUser(data: any): void {
    let user = this.tokenStorage.getUser();
    user = {
      ...user,
      ...data,
    };
    this.tokenStorage.saveUser(user);
    this.currentUserSubject.next(user);
  }

  requestPasswordRecovery(data: any, token: string): Observable<any> {
    return this.http.post('/api/auth/password_reset_request', {
      ...data,
      token,
    });
  }

  changePassword(
    data: any,
    resetToken: string,
    captchaToken: string
  ): Observable<any> {
    return this.http.post('/api/auth/change_password', {
      reset_password_token: resetToken,
      token: captchaToken,
      ...data,
    });
  }
}
