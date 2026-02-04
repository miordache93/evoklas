import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../../core/layout/layout.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HomeComponent implements OnInit {
  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.subscribeToLayoutChanges().subscribe(() => {});
  }
}
