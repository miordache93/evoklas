import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

import { MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { User } from '../../../core/auth/models/user.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import SubscriptionService from '../../../features/subscription/services/subscription.service';

const LANGUAGES = [
  {
    id: 'ro',
    name: 'RO',
    flag: './assets/images/languages/ro.png',
  },
  {
    id: 'en',
    name: 'EN',
    flag: './assets/images/languages/en.png',
  },
];

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    SelectModule,
    MenuModule,
    ButtonModule,
  ],
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] = [];
  notificationItems: MenuItem[] = [];
  notifications: any[] = [];
  isLoggedIn = false;
  currentUser: User | null = null;
  isMobile = false;
  isTabletLandscape = false;
  languages = LANGUAGES;
  selectedLanguage: any = null;
  credits$ = new Observable();

  logoutItem = {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    state: {
      key: 'logout',
    },
    title: 'Logout',
    command: () => {
      this.authService.logout();
    },
  };
  messagesItem: MenuItem = {
    label: 'Inbox',
    icon: 'fas fa-envelope',
    routerLink: '/messages',
    title: 'Messages',
    state: {
      key: 'inbox',
    },
  };
  subscriptionItem: MenuItem = {
    label: 'Add credits',
    title: 'Add credits',
    icon: 'fas fa-donate',
    routerLink: '/subscriptions',
    routerLinkActiveOptions: {
      exact: true,
    },
    state: {
      key: 'subscriptions',
    },
  };
  userProfileItem = {
    label: 'Profile',
    title: 'Profile',
    icon: 'pi pi-id-card',
    routerLink: '/user-profile',
    routerLinkActiveOptions: {
      exact: true,
    },
    state: {
      key: 'profile',
    },
  };
  requestsItem = {
    label: 'Requests',
    title: 'Requests',
    icon: 'pi pi-briefcase',
    routerLink: '/requests',
    routerLinkActiveOptions: {
      exact: true,
    },
    state: {
      key: 'requests',
    },
  };
  notificationsItem = {
    label: 'Notifications',
    icon: 'pi pi-bell',
    title: 'Notifications',
    routerLink: '/requests',
    routerLinkActiveOptions: {
      exact: true,
    },
    state: {
      key: 'notifications',
    },
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    const stored =
      localStorage.getItem('selected_language') || this.languages[0].id;
    this.selectedLanguage = this.languages.find((l) => l.id === stored);
    this.translate.setDefaultLang(stored);
    this.translate.use(stored);
    this.items = [this.messagesItem, this.logoutItem];

    this.translateNavbarItems();
    this.items = [...this.items]; // force refresh for PrimeNG

    this.translate.onLangChange.subscribe(() => {
      this.translateNavbarItems();
      this.items = [...this.items];
    });

    this.credits$ = this.subscriptionService.creditsObs$;

    this.authService.currentUser.subscribe((data: any) => {
      this.currentUser = data;
      if (data) {
        if (
          !this.items.find(
            (item) => item.state && item.state['key'] === 'profile'
          )
        ) {
          this.items.splice(1, 0, this.userProfileItem);
        }

        if (data.role === 'DEALER') {
          if (
            !this.items.find(
              (item) => item.state && item.state['key'] === 'subscriptions'
            )
          ) {
            this.items.splice(1, 0, this.subscriptionItem);
          }

          if (
            !this.items.find(
              (item) => item.state && item.state['key'] === 'requests'
            )
          ) {
            this.items.splice(1, 0, this.requestsItem);
          }
        }
      } else {
        // if (!this.items.find(item => item.label === 'User profile')) {
        //   this.items.splice(1, 0, this.userProfileItem);
        // }
      }
    });

    if (localStorage.getItem('selected_language')) {
      this.selectedLanguage = this.languages.find(
        (l) => l.id === localStorage.getItem('selected_language')
      );
    } else {
      this.selectedLanguage = this.languages[0];
    }

    this.requestsItem.label = this.translate.instant('APP.HEADER.REQUESTS');
    this.subscriptionItem.label = this.translate.instant('APP.HEADER.OFFERS');
    this.userProfileItem.label = this.translate.instant('APP.HEADER.PROFILE');

    // Notifications
    this.subscriptionService.notificationsObs$.subscribe((notifications) => {
      const notificationItems: any = [];
      this.notifications = notifications;

      const requestsItem = this.items.find(
        (t) => t.state && t.state['key'] === 'request'
      );
      const inboxItem = this.items.find(
        (t) => t.state && t.state['key'] === 'inbox'
      );

      const inboxLabel = this.translate.instant('APP.HEADER.INBOX');
      const requestsLabel = this.translate.instant('APP.HEADER.REQUESTS');

      if (notifications && notifications.length > 0) {
        const noReq = notifications.filter(
          (n: any) => n.type === 'REQUEST'
        ).length; // number of request notifications
        const noMsj = notifications.filter(
          (n: any) => n.type !== 'REQUEST'
        ).length; // number of message notifications

        const reqNotification = {
          label: `${this.translate.instant(
            'APP.HEADER.NOTIFICATIONS.REQUESTS.TEXT1'
          )} ${noReq} ${this.translate.instant(
            'APP.HEADER.NOTIFICATIONS.REQUESTS.TEXT2'
          )}`,
          icon: 'pi pi-briefcase',
          state: {
            type: 'REQUEST',
          },
          command: (event: any) => {
            this.subscriptionService
              .readRequestNotifications()
              .subscribe(() => {
                this.router.navigateByUrl('/requests');
              });
          },
        };

        const msgNotification = {
          label: `${this.translate.instant(
            'APP.HEADER.NOTIFICATIONS.MESSAGES.TEXT1'
          )} ${noMsj} ${this.translate.instant(
            'APP.HEADER.NOTIFICATIONS.MESSAGES.TEXT2'
          )}`,
          icon: 'pi pi-inbox',
          state: {
            type: 'MESSAGE',
          },
          routerLinkActiveOptions: {
            exact: true,
          },
          routerLink: '/messages',
        };

        if (noReq > 0) {
          notificationItems.push(reqNotification);
          if (requestsItem) {
            requestsItem.label = `${requestsLabel} (${noReq})`;
          }
        } else if (requestsItem) {
          requestsItem.label = requestsLabel;
        }

        if (noMsj > 0) {
          notificationItems.push(msgNotification);
          if (inboxItem) {
            inboxItem.label = `${inboxLabel} (${noMsj})`;
          }
        } else if (inboxItem) {
          inboxItem.label = inboxLabel;
        }

        this.notificationItems = notificationItems;
      } else {
        this.notificationItems = [];
        if (inboxItem) {
          inboxItem.label = inboxLabel;
        }

        if (requestsItem) {
          requestsItem.label = requestsLabel;
        }
      }
    });
  }

  translateNavbarItems(): void {
    this.requestsItem.label = this.translate.instant('APP.HEADER.REQUESTS');
    this.subscriptionItem.label = this.translate.instant('APP.HEADER.OFFERS');
    this.userProfileItem.label = this.translate.instant('APP.HEADER.PROFILE');
  }

  switchLanguage(languageId: string): void {
    localStorage.setItem('selected_language', languageId);
    this.translate.setDefaultLang(languageId);
    this.translate.use(languageId);
  }
}
