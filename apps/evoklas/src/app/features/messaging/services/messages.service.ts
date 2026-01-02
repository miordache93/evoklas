import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class MessagesService {
  messagesSubject = new BehaviorSubject([]);
  messagesObs$ = this.messagesSubject.asObservable();
  messagePollSubscription: Subscription = new Subscription();
  selectedRequestSubject = new BehaviorSubject('');
  selectedRequestObs$ = this.selectedRequestSubject.asObservable();

  constructor(private http: HttpClient) {}

  readMessageNotifications(): Observable<any> {
    return this.http.put(`/api/notifications/messages`, {});
  }

  selectRequest(requestId: any): void {
    this.selectedRequestSubject.next(requestId);
  }

  readRequestMessages(requestId: any): Observable<any> {
    return this.http.post(`/api/messages/${requestId}`, {
      requestId,
    });
  }

  getMessagesV2(requestId: any, queryParams?: any): Observable<any> {
    let requestsUrl = `/api/messages/v2/${requestId}/`;
    if (
      queryParams &&
      queryParams.hasOwnProperty('size') &&
      queryParams.hasOwnProperty('page')
    ) {
      const { size, page } = queryParams;
      requestsUrl += `?size=${size}&page=${page}`;
    }

    return this.http.get(requestsUrl);
  }

  getLastMessages(requestId: any): Observable<any> {
    return this.http.get(`/api/messages/last/${requestId}`);
  }

  sendMessaage({ text, receiverId, attachment, reqId }: any): Observable<any> {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('receiverId', receiverId);
    formData.append('reqId', reqId);
    formData.append('file', attachment);

    return this.http.post('/api/messages', formData);
  }

  // when getting the messages if senderId !== userId mark message as read
  // && user is allowed to read them bassed on subscription
  // if the user is allowed to see the messages return messages otherwise return unread messages.length
  getMessagesByRequestId(reqId: number): Observable<any> {
    return this.http.get(`/api/messages/${reqId}`);
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

  getMessages(requestId: any): void {
    this.messagePollSubscription = this.getMessagesByRequestId(requestId)
      .pipe(
        this.pollWhile(5000, (res) => true) // poll every 5 sec
      )
      .subscribe((res) => {
        this.messagesSubject.next(res);
      });
  }

  cleanupMessagePoll(): void {
    this.messagesSubject.next([]);
    if (this.messagePollSubscription) {
      this.messagePollSubscription.unsubscribe();
    }
  }
}
