import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
// import { FileService } from '@services/helpers/file.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { environment } from 'src/environments';
// import { DataService } from '..';
import { CarDataService } from '../services/car-data.service';
import { HttpClientService } from '../../../core/http/services/http-client.service';
import { APP_ENV } from '../../../core/config/environment.tokens';

@Injectable({
  providedIn: 'root',
})
export class ProducersResolver implements Resolve<any> {
  private readonly env = inject(APP_ENV);

  constructor(
    private carDataService: CarDataService,
    private httpClientDataService: HttpClientService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return combineLatest(
      this.carDataService.getProducersFromDealers(),
      this.httpClientDataService.getCities()
    ).pipe(
      map(([res1, res2]) => {
        const apiUrl = this.env.apiUrl?.replace(/\/$/, '');
        const producers = res1.map((producer: any) => {
          if (
            apiUrl &&
            producer?.icon &&
            !/^https?:\/\//i.test(producer.icon)
          ) {
            const normalized = producer.icon.replace(/^\/+/, '');
            producer.icon = `${apiUrl}/${normalized}`;
          }
          return producer;
        });

        return {
          producers,
          cities: res2,
        };
      })
    );
  }
}
