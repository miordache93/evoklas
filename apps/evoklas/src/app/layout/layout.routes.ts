import { Route } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { ProducersResolver } from '../features/car-selection/resolvers/car-producers.resolver';
import { AuthGuard } from '../core/auth/guards/auth.guard';
import { DealerGuard } from '../core/auth/guards/dealer.guard';

const loadTerms = () =>
  import(
    './components/terms-and-conditions/terms-and-conditions.component'
  ).then((m) => m.TermsAndConditionsComponent);

const loadPrivacy = () =>
  import('./components/privacy-and-policy/privacy-and-policy.component').then(
    (m) => m.PrivacyAndPolicyComponent
  );

const loadCookies = () =>
  import('./components/cookies-policy/cookies-policy.component').then(
    (m) => m.CookiesPolicyComponent
  );

const loadGdpr = () =>
  import('./components/gdpr/gdpr.component').then((m) => m.GdprComponent);

const loadHome = () =>
  import('./components/home-landing/home-landing.component').then(
    (m) => m.HomeLandingComponent
  );

const loadLogin = () =>
  import('../features/auth/components/login/login-page.component').then(
    (m) => m.LoginPageComponent
  );

const loadRegister = () =>
  import('../features/auth/components/register/register.component').then(
    (m) => m.RegisterComponent
  );

const loadPlaceholder = () =>
  import('./components/placeholder-page/placeholder-page.component').then(
    (m) => m.PlaceholderPageComponent
  );

const loadCarSelector = () =>
  import('../features/car-selection/components/car-selector.component').then(
    (m) => m.CarSelectorComponent
  );

const loadMessages = () =>
  import(
    '../features/messaging/components/messages-page/messages-page.component'
  ).then((m) => m.MessagesPageComponent);

const loadRequests = () =>
  import('../features/requests/components/requests.component').then(
    (m) => m.RequestsComponent
  );

const loadUserProfile = () =>
  import(
    '../features/user-management/components/user-profile/user-profile.component'
  ).then((m) => m.UserProfileComponent);

const loadSubscriptions = () =>
  import(
    '../features/subscription/components/subscription-offers/subscription-offers.component'
  ).then((m) => m.SubscriptionOffersComponent);

export const layoutRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', loadComponent: loadHome },
      { path: 'login', loadComponent: loadLogin },
      {
        path: 'register',
        loadComponent: loadRegister,
      },
      {
        path: 'car-selector',
        loadComponent: loadCarSelector,
        resolve: { carSelectorData: ProducersResolver },
      },
      {
        path: 'messages',
        loadComponent: loadMessages,
        canActivate: [AuthGuard],
      },
      {
        path: 'requests',
        loadComponent: loadRequests,
        canActivate: [AuthGuard, DealerGuard],
      },
      {
        path: 'user-profile',
        loadComponent: loadUserProfile,
        canActivate: [AuthGuard],
      },
      {
        path: 'subscriptions',
        loadComponent: loadSubscriptions,
        canActivate: [AuthGuard, DealerGuard],
      },
      { path: 'terms-and-conditions', loadComponent: loadTerms },
      { path: 'privacy-and-policy', loadComponent: loadPrivacy },
      { path: 'cookies-policy', loadComponent: loadCookies },
      { path: 'gdpr', loadComponent: loadGdpr },
      { path: '**', redirectTo: '' },
    ],
  },
];
