import {
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { fromEvent, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/services/auth.service';
import { HttpClientService } from '../../../core/http/services/http-client.service';

export const CLIENTS_FEEDBACK = [
  {
    id: 0,
    text: 'Am trimis o singura cerere si am primit mai multe oferte in aceeasi zi. Comparatia a fost rapida, iar pretul final a fost sub ce gaseam direct la dealer.',
    authorName: 'Andrei Popescu',
    postedAt: '12 APRILIE 2024',
    authorAvatarPath: './assets/images/feedback/avatar1.png',
  },
  {
    id: 1,
    text: 'Proces simplu si fara drumuri. Am ales configuratia, am trimis cererea si am primit raspunsuri clare de la mai multi dealeri.',
    authorName: 'Ioana Dumitru',
    postedAt: '05 MARTIE 2024',
    authorAvatarPath: './assets/images/feedback/avatar2.png',
  },
];

@Component({
  selector: 'app-home-landing',
  templateUrl: './home-landing.component.html',
  styleUrls: ['./home-landing.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
})
export class HomeLandingComponent implements OnInit {
  @ViewChild('faqList') faqList: ElementRef = new ElementRef(null);
  @ViewChild('feedbackEl') feedBackEl: ElementRef = new ElementRef(null);

  isTablet = false;
  isTabletLandscape = false;
  mobileImagePath = '';
  feedbacks: any;
  currentUser: any = null;
  packages: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private destroyRef: DestroyRef,
    private httpClientDataService: HttpClientService
  ) {}

  ngOnInit(): void {
    this.feedbacks = CLIENTS_FEEDBACK;

    fromEvent(window, 'resize')
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateViewport());

    this.authService.currentUser.subscribe((data: any) => {
      this.currentUser = data;
    });

    this.httpClientDataService.getPackages().subscribe((res: any) => {
      this.packages = Array.isArray(res) ? res : [];
    });
  }

  private updateViewport(): void {
    const width = window.innerWidth;

    const PHONE = 600;
    const TABLET = 900;
    const TABLET_LANDSCAPE = 1200;
    const DESKTOP = 1600;

    if (width <= TABLET) {
      this.isTablet = true;
      this.isTabletLandscape = false;
      this.mobileImagePath =
        width <= PHONE
          ? './assets/images/banner/hero_phone.png'
          : './assets/images/banner/hero_phone_landscape.png';
      return;
    }

    this.isTablet = false;

    if (width <= TABLET_LANDSCAPE) {
      this.isTabletLandscape = true;
      this.mobileImagePath = './assets/images/banner/hero_tablet_portrait.png';
      return;
    }

    this.isTabletLandscape = false;
    if (width <= DESKTOP) {
      this.mobileImagePath = './assets/images/banner/hero_tablet_landscape.png';
    } else {
      this.mobileImagePath = './assets/images/banner/hero_desktop_large.png';
    }
  }

  toggleFaqList(index: number): void {
    const accordionElements = new Array(
      this.faqList.nativeElement.getElementsByClassName('accordion')
    )[0];
    for (let i = 0; i < accordionElements.length; i++) {
      const panel = accordionElements[i].nextElementSibling;
      if (index === i) {
        if (panel.style.display === 'block') {
          panel.style.display = 'none';
        } else {
          panel.style.display = 'block';
        }
      } else {
        panel.style.display = 'none';
      }
    }
  }

  navigateUser(): void {
    if (this.currentUser && this.currentUser.role === 'DEALER') {
      this.router.navigate(['/requests']);
    } else {
      this.router.navigate(['/car-selector']);
    }
  }
}
