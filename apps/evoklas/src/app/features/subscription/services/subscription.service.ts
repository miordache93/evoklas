import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  last,
  MonoTypeOperatorFunction,
  Observable,
  scan,
  Subscription,
  switchMapTo,
  takeWhile,
  timer,
} from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
class SubscriptionService {
  creditsSubject = new BehaviorSubject(0);
  creditsObs$ = this.creditsSubject.asObservable();
  notificationsSubject = new BehaviorSubject([]);
  notificationsObs$ = this.notificationsSubject.asObservable();
  notificationsPollSubscription: Subscription = new Subscription();
  creditsPollSubscription: Subscription = new Subscription();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.getNotifications();
        if (user.role === 'DEALER') {
          this.getCredits();
        }
      } else {
        this.cleanupNotificationPoll();
        this.cleanupCreditsPoll();
      }
    });
  }

  pollWhile<T>(
    pollInterval: number,
    isPollingActive: (res: T) => boolean,
    emitOnlyLast = false
  ): MonoTypeOperatorFunction<T> {
    return (source$) => {
      const poll$ = timer(0, pollInterval).pipe(
        scan((attempts) => ++attempts, 0),
        switchMapTo(source$),
        takeWhile(isPollingActive, true)
      );

      return emitOnlyLast ? poll$.pipe(last()) : poll$;
    };
  }

  getUserNotifications(): Observable<any> {
    return this.http.get('/api/notifications');
  }

  getNotifications(): void {
    this.notificationsPollSubscription = this.getUserNotifications()
      .pipe(
        this.pollWhile(5000, (res) => true) // poll every 5 seconds
      )
      .subscribe((res) => {
        this.notificationsSubject.next(res);
      });
  }

  getCredits(): void {
    this.creditsPollSubscription = this.getUserRequestsLimit()
      .pipe(
        this.pollWhile(30000, (res) => false) // poll every 5 minutes
      )
      .subscribe((res) => {
        if (res) {
          this.creditsSubject.next(res.userLimit);
        }
      });
  }

  readNotification(notificationId: any): Observable<any> {
    return this.http.put(`/api/notifications/${notificationId}`, {});
  }

  readRequestNotifications(): Observable<any> {
    return this.http.put(`/api/notifications/requests`, {});
  }

  getUserRequestsLimit(): Observable<any> {
    return this.http.get('/api/users/requestsLimit');
  }

  cleanupNotificationPoll(): void {
    this.notificationsSubject.next([]);
    if (this.notificationsPollSubscription) {
      this.notificationsPollSubscription.unsubscribe();
    }
  }

  cleanupCreditsPoll(): void {
    this.creditsSubject.next(0);
    if (this.creditsPollSubscription) {
      this.creditsPollSubscription.unsubscribe();
    }
  }
}

export default SubscriptionService;
