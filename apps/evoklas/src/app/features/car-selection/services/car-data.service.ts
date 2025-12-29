import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../../core/auth/services/auth.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarDataService {
  constructor(private http: HttpClient, private authService: AuthService) {}

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
}
