import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestsDataService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  sendRequest(clientRequestData: any): Observable<any> {
    return this.http.post('/api/clientRequest', clientRequestData);
  }

  getRequests(): Observable<any> {
    if (this.authService.currentUserValue?.role === 'DEALER') {
      return this.http.get('/api/requests/');
    } else {
      return this.http.get('/api/requests/client');
    }
  }
}
