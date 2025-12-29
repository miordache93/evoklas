import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
})
export class FooterComponent {
  footerPages: { path: string; title: string }[] = [];

  constructor(private translate: TranslateService) {
    this.footerPages = [
      {
        path: '/contact-us',
        title: this.translate.instant('APP.FOOTER.LINKS.CONTACT_US'),
      },
      {
        path: '/privacy-and-policy',
        title: this.translate.instant('APP.FOOTER.LINKS.PRIVACY_AND_POLICY'),
      },
      {
        path: '/cookies-policy',
        title: this.translate.instant('APP.FOOTER.LINKS.COOKIES_POLICY'),
      },
      {
        path: '/terms-and-conditions',
        title: this.translate.instant('APP.FOOTER.LINKS.TERMS_AND_CONDITIONS'),
      },
    ];
  }
}
