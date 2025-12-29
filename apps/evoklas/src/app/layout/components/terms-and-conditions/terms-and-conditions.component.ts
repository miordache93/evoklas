import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, NgxExtendedPdfViewerModule],
})
export class TermsAndConditionsComponent implements OnInit {
  pdfSrc = '/assets/docs/evoklas_terms_and_conditions.pdf';

  constructor() {}

  ngOnInit(): void {}
}
