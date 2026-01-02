import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ScrollerModule } from 'primeng/scroller';

@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ButtonModule,
    CardModule,
    AvatarModule,
    BadgeModule,
    ProgressBarModule,
    ScrollerModule,
  ],
})
export class RequestsListComponent implements OnInit {
  @Input() requests: any[] = [];
  @Input() blocked = false;
  @Output() clicked = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  selectRequest(request: any): void {
    this.clicked.emit(request);
  }
}
