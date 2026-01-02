import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  conversationsSubject = new BehaviorSubject([]);
  conversationsObs$ = this.conversationsSubject.asObservable();
  notificationsSubject = new BehaviorSubject([]);
  notificationsObs$ = this.notificationsSubject.asObservable();
  loadingSubject = new BehaviorSubject(false);
  loadingObs$ = this.loadingSubject.asObservable();
  creditsSubject = new BehaviorSubject(0);
  creditsObs$ = this.creditsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  saveProducer({ name, icon }: any): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', icon);

    return this.http.post('/api/producers', formData);
  }

  saveCarModel(carModel: any): Observable<any> {
    const { name, icon, savingsDescription, producer } = carModel;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', icon);
    formData.append('description', savingsDescription);
    formData.append('producerId', producer.id);

    return this.http.post('/api/cars', formData);
  }

  saveCarVersion(carVersion: any): Observable<any> {
    const { name, icon, startingPrice, car } = carVersion;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', icon);
    formData.append('startingPrice', startingPrice);
    formData.append('carId', car.id);
    return this.http.post('/api/cars/versions', formData);
  }

  saveEngineModel(engineData: any): Observable<any> {
    return this.http.post('/api/cars/engines', engineData);
  }

  sendRequest(clientRequestData: any): Observable<any> {
    return this.http.post('/api/clientRequest', clientRequestData);
  }

  getProducers(): Observable<any> {
    return this.http.get('/api/producers');
  }

  getProducersFromDealers(): Observable<any> {
    return this.http.get('/api/producersFromDealers').pipe(
      map((res: any) => {
        return res.sort((a: any, b: any) => a.name.localeCompare(b.name));
      })
    );
  }

  getCarsByProducer(producerId: number): Observable<any> {
    return this.http.get(`/api/cars/${producerId}`);
  }

  getVersionsByCar(carId: number): Observable<any> {
    return this.http.get(`/api/cars/versions/${carId}`);
  }

  getEnginesByCarAndFuelType(
    carId: number,
    versionId: string,
    fuelType: string
  ): Observable<any> {
    return this.http.get(
      `/api/cars/${carId}/versions/${versionId}/engines?fuelType=${fuelType}`
    );
  }

  getEnginesByCarVersion(carId: number, versionId: string): Observable<any> {
    return this.http.get(`/api/cars/${carId}/versions/${versionId}`);
  }

  getRequests(): Observable<any> {
    if (this.authService.currentUserValue?.role === 'DEALER') {
      return this.http.get('/api/requests/');
    } else {
      return this.http.get('/api/requests/client');
    }
  }

  getRequestsV2(queryParams?: any): Observable<any> {
    let requestsUrl = `/api/requests/v2`;
    if (
      queryParams &&
      queryParams.hasOwnProperty('size') &&
      queryParams.hasOwnProperty('page')
    ) {
      const { name, size, page, readable, preselectedRequestId } = queryParams;
      requestsUrl += `?size=${size}&page=${page}&readable=${readable}`;
      if (name) {
        requestsUrl += `&name=${name}`;
      }
      if (preselectedRequestId) {
        requestsUrl += `&reqId=${preselectedRequestId}`;
      }
    }

    return this.http.get(requestsUrl);
  }

  downloadFileAttachment(data: any): Observable<any> {
    const httpOptions = {
      responseType: 'blob' as 'json',
    };
    return this.http.post('/api/messages/download', data, httpOptions);
  }

  getCities(): Observable<any> {
    return this.http.get('/api/cities');
  }

  getPackages(): Observable<any> {
    return this.http.get('/api/packages');
  }

  buyPackage(packageId: any): Observable<any> {
    return this.http.post('/api/packages', {
      packageId,
    });
  }

  useCredit(requestId: any): Observable<any> {
    return this.http.post('/api/requests/useCredit', {
      requestId,
    });
  }

  createCheckoutSession(packageData: any): Observable<any> {
    return this.http.post('/api/create-checkout-session', packageData);
  }

  getUserRequestsLimit(): Observable<any> {
    return this.http.get('/api/users/requestsLimit');
  }

  updateProgressBarValue(value: boolean): void {
    this.loadingSubject.next(value);
  }

  getUserNotifications(): Observable<any> {
    return this.http.get('/api/notifications');
  }

  getUserData(): Observable<any> {
    return this.http.get('/api/users');
  }

  editUser(userData: any): Observable<any> {
    return this.http.put('/api/users', userData);
  }

  getTransactions(): Observable<any> {
    return this.http.get('/api/transactions');
  }

  deleteUser(): Observable<any> {
    return this.http.delete('/api/users');
  }

  getDealerInfo(): Observable<any> {
    // return of(null);
    return this.http.get('/api/dealer/details');
  }

  setDealerInfo(data: any): Observable<any> {
    return this.http.post('/api/dealer/details', data);
  }
}
