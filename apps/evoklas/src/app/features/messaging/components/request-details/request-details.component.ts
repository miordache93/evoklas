import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, DividerModule, AvatarModule],
})
export class RequestDetailsComponent implements OnInit {
  @Input() request: any;

  constructor() {}

  ngOnInit(): void {}
}
