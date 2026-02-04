import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { User } from '../../../core/auth/models/user.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { CustomBreakpointNames } from '../../../core/layout/breakpoints.service';
import { LayoutService } from '../../../core/layout/layout.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] = [];
  isLoggedIn = false;
  currentUser: User | null = null;
  isMobile = false;

  logoutItem = {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => {
     this.authService.logout();
    }
  };
  mobileViewItems = [
    {
      label: 'Cars',
      icon: 'fas fa-car',
      command: () => {
       this.router.navigate(['/cars']);
      }
    },
    {
      label: 'Users',
      icon: 'fas fa-users',
      command: () => {
        this.router.navigate(['/users']);

      }
    },
    {
      label: 'Requests',
      icon: 'fab fa-creative-commons-share',
      command: () => {
        this.router.navigate(['/requests']);

      }
    },
    {
      label: 'Packages',
      icon: 'fas fa-money-bill-wave',
      command: () => {
        this.router.navigate(['/packages']);
      }
    }
  ];

  constructor(
    private router: Router,
    private layoutService: LayoutService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.items = [this.logoutItem];

    this.layoutService.subscribeToLayoutChanges().subscribe(() => {
      if (
        this.layoutService.isBreakpointActive(
          CustomBreakpointNames.phoneLandscape
        )
      ) {
        this.isMobile = true;
        this.items = [...this.mobileViewItems, ...this.items];
      } else {
        this.isMobile = false;
        this.items = [this.logoutItem];
      }
    });

    this.authService.currentUser.subscribe((data: any) => {
      this.currentUser = data;
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
