import { Route } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AuthGuard } from '../core/auth/guards/auth.guard';

const loadLogin = () =>
  import('../features/auth/components/login/login.component').then(
    (m) => m.LoginComponent
  );

const loadRegister = () =>
  import('../features/auth/components/register/register.component').then(
    (m) => m.RegisterComponent
  );

const loadHome = () =>
  import('./components/home/home.component').then((m) => m.HomeComponent);

const loadMessages = () =>
  import('../features/messages/components/messages/messages.component').then(
    (m) => m.MessagesComponent
  );

const loadAdminDashboard = () =>
  import(
    '../features/admin-dashboard/components/admin-dashboard/admin-dashboard.component'
  ).then((m) => m.AdminDashboardComponent);

const loadUserAdmin = () =>
  import('../features/user-admin/components/user-admin/user-admin.component').then(
    (m) => m.UserAdminComponent
  );

const loadSupportTeam = () =>
  import(
    '../features/support-team/components/support-team/support-team.component'
  ).then((m) => m.SupportTeamComponent);

const loadClientRequest = () =>
  import(
    '../features/client-request/components/client-request/client-request.component'
  ).then((m) => m.ClientRequestComponent);

const loadPackages = () =>
  import('../features/packages/components/packages/packages.component').then(
    (m) => m.PackagesComponent
  );

export const layoutRoutes: Route[] = [
  { path: 'login', loadComponent: loadLogin },
  { path: 'register', loadComponent: loadRegister },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', loadComponent: loadHome },
      { path: 'messages', loadComponent: loadMessages },
      { path: 'cars', loadComponent: loadAdminDashboard },
      { path: 'users', loadComponent: loadUserAdmin },
      { path: 'support', loadComponent: loadSupportTeam },
      { path: 'requests', loadComponent: loadClientRequest },
      { path: 'packages', loadComponent: loadPackages },
    ],
  },
];
