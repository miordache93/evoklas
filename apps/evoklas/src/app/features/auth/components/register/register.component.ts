import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TabsModule } from 'primeng/tabs';
import { RegisterClientFormComponent } from '../../components/register-client-form/register-client-form.component';
import { RegisterDealerFormComponent } from '../../components/register-dealer-form/register-dealer-form.component';
import { RouterLink } from '@angular/router';

import { switchMap } from 'rxjs/operators';
import { HttpClientService } from 'apps/evoklas/src/app/core/http/services/http-client.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    TabsModule,
    RegisterClientFormComponent,
    RegisterDealerFormComponent,
    RouterLink,
  ],
})
export class RegisterComponent implements OnInit {
  selectedRegistration: 'CLIENT' | 'DEALER' | null = null;
  cities = [];
  brands = [];
  stateOptions: any[] = [];

  constructor(private httpClientService: HttpClientService) {
    this.stateOptions = [
      { label: 'CLIENT', value: 'CLIENT' },
      { label: 'DEALER', value: 'DEALER' },
    ];
  }

  ngOnInit(): void {
    this.httpClientService
      .getCities()
      .pipe(
        switchMap((res) => {
          this.cities = res;
          return this.httpClientService.getProducers();
        })
      )
      .subscribe((res: any) => {
        this.brands = res;
      });
  }
}
