import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { TokenStorageService } from './token-storage.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root'
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

  login(email: string, password: string): Observable<any> {
    return this.http
      .post(
        `/api/auth/admin/signin`,
        {
          email,
          password,
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

  register(role: string, registrationData: any): Observable<any> {
    registrationData = {
      ...registrationData,
      role
    };
    return this.http.post(
      `/api/auth/admin/signup`,
      {
        ...registrationData,
      },
      httpOptions
    );
  }

  logout(): void {
    this.router.navigate(['/']);
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null);
  }
}
