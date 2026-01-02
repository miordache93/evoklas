import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    ToastModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly isNavigating = signal(false);

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isNavigating.set(true);
        }

        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.isNavigating.set(false);
        }
      });
  }
}
