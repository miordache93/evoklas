import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabsModule } from 'primeng/tabs';
import { RequestsListComponent } from './requests-list/requests-list.component';
import { SkeletonModule } from 'primeng/skeleton';

import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { RequestsDataService } from '../services/requests.service';
import { HttpClientService } from '../../../core/http/services/http-client.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ConfirmDialogModule,
    TabsModule,
    SkeletonModule,
    RequestsListComponent,
  ],
})
export class RequestsComponent implements OnInit {
  tabIndex = 0;
  blockedRequests: any[] = [];
  unblockedRequests: any[] = [];
  allRequests: any[] = [];
  msgs: any[] = [];
  currentUser: any = null;
  isLoading = false;

  constructor(
    private requestsService: RequestsDataService,
    private httpClientService: HttpClientService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getRequests();

    this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });
  }

  getRequests(): void {
    this.isLoading = true;
    this.requestsService.getRequestsV2().subscribe(
      (res) => {
        this.allRequests = res;
        this.blockedRequests = res.filter((request: any) => !request.readable);
        this.unblockedRequests = res.filter((request: any) => request.readable);

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
      }
    );
  }

  selectRequests(event: any): void {
    /*
    if (blocked) => request to pay
    else navigate to inbox to this conversation request
    */
    if (event.readable) {
      this.router.navigate(['messages', { requestId: event.id }]);
    } else {
      this.useCredit(event);
    }
  }

  useCredit(request: any): void {
    if (this.currentUser.requestsLimit < 1) {
      this.messageService.add({
        severity: 'info',
        summary: this.translate.instant(
          'APP.PAGES.REQUESTS.NOT_ENOUGH_CREDIT.TITLE'
        ),
        detail: this.translate.instant(
          'APP.PAGES.REQUESTS.NOT_ENOUGH_CREDIT.MESSAGE'
        ),
      });
      setTimeout(() => {
        this.router.navigate(['/subscriptions']);
      }, 2000);

      return;
    }

    const confirmationMessage: any = {
      text: this.translate.instant('APP.PAGES.REQUESTS.USE_CREDIT.TEXT'),
      header: this.translate.instant('APP.PAGES.REQUESTS.USE_CREDIT.HEADER'),
      accept: {
        summary: this.translate.instant(
          'APP.PAGES.REQUESTS.USE_CREDIT.ACCEPT.SUMMARY'
        ),
        detail: this.translate.instant(
          'APP.PAGES.REQUESTS.USE_CREDIT.ACCEPT.DETAIL'
        ),
      },
      reject: {
        summay: this.translate.instant(
          'APP.PAGES.REQUESTS.USE_CREDIT.REJECT.SUMMARY'
        ),
        details: this.translate.instant(
          'APP.PAGES.REQUESTS.USE_CREDIT.REJECT.DETAIL'
        ),
      },
    };

    this.confirmationService.confirm({
      message: confirmationMessage.text,
      header: confirmationMessage.header,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.msgs = [
          {
            severity: 'info',
            summary: confirmationMessage.accept.summary,
            detail: confirmationMessage.accept.detail,
          },
        ];
        this.httpClientService
          .useCredit(request.id)
          .subscribe((requests: any) => {
            this.httpClientService.getUserRequestsLimit().subscribe((res) => {
              this.authService.updateUser(res.userLimit);
              this.getRequests();
            });
          });
      },
      reject: () => {
        this.msgs = [
          {
            severity: 'info',
            summary: confirmationMessage.reject.summary,
            detail: confirmationMessage.reject.summary,
          },
        ];
      },
    });
  }
}
