import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { HttpClientService } from 'apps/evoklas/src/app/core/http/services/http-client.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-subscription-offers',
  templateUrl: './subscription-offers.component.html',
  styleUrls: ['./subscription-offers.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, CardModule, ButtonModule],
})
export class SubscriptionOffersComponent implements OnInit {
  packages: Array<{
    id: number;
    title: string;
    price: number;
    nr_requests: number;
    description: string;
  }> = [];
  selectedPackage: any = null;
  hasBillingInfo = false;

  constructor(
    private httpClientDataService: HttpClientService,
    private router: Router,
    private translate: TranslateService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.httpClientDataService.getPackages().subscribe((res: any) => {
      this.packages = res;
      this.getBillingInfoData();
    });
  }

  getBillingInfoData(): void {
    this.httpClientDataService.getDealerInfo().subscribe((res) => {
      if (res && this.checkBillingInfo(res)) {
        this.hasBillingInfo = true;
      }
    });
  }

  checkBillingInfo(data: any): boolean {
    return (
      !!data.address &&
      !!data.company_name &&
      !!data.bank_name &&
      !!data.iban_code &&
      !!data.registration_number &&
      !!data.vat_number
    );
  }

  buyDefaultPackage(packageData: any): void {
    this.httpClientDataService
      .buyPackage(packageData.id)
      .pipe(switchMap(() => this.httpClientDataService.getUserRequestsLimit()))
      .subscribe(
        () => {
          this.messageService.add({
            severity: 'success',
            summary:
              this.translate.instant('APP.SUCCESS.SUBSCRIPTION_PURCHASED') ||
              'Pachet achiziționat',
          });
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('APP.ERRORS.0.title') || 'Eroare',
            detail:
              error?.error?.message ||
              this.translate.instant('APP.ERRORS.0.message') ||
              'Nu am putut procesa comanda.',
          });
        }
      );
  }

  selectPackage(packageData: any): void {
    if (!this.hasBillingInfo) {
      return;
    }
    this.selectedPackage = packageData;
    this.httpClientDataService.createCheckoutSession(this.selectedPackage).subscribe(
      (res) => {
        this.messageService.add({
          severity: 'success',
          summary:
            this.translate.instant('APP.SUCCESS.SUBSCRIPTION_PURCHASED') ||
            'Pachet achiziționat',
        });
        window.location = res.url;
      },
      (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('APP.ERRORS.0.title') || 'Eroare',
          detail:
            err?.error?.message ||
            this.translate.instant('APP.ERRORS.0.message') ||
            'Nu am putut iniția plata.',
        });
      }
    );
  }

  navigateToUserProfile(): void {
    this.router.navigate(['user-profile', { tabIndex: '1' }]);
  }
}
