import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-gdpr',
  templateUrl: './gdpr.component.html',
  styleUrls: ['./gdpr.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, NgxExtendedPdfViewerModule],
})
export class GdprComponent implements OnInit {
  pdfSrc = '/assets/docs/evoklas_confidentiality_policy.pdf';

  constructor() {}

  ngOnInit(): void {}
}
