import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-cookies-policy',
  templateUrl: './cookies-policy.component.html',
  styleUrls: ['./cookies-policy.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, NgxExtendedPdfViewerModule],
})
export class CookiesPolicyComponent implements OnInit {
  pdfSrc = '/assets/docs/evoklas_cookies_policy.pdf';

  constructor() {}

  ngOnInit(): void {}
}
