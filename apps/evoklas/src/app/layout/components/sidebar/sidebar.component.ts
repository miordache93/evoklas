import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { NavigationComponent } from '../navigation/navigation.component';
import { NavigationItem } from '../../models/navigation-item';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NavigationComponent, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  items = input.required<NavigationItem[]>();
  collapsed = input(false);

  navigate = output<NavigationItem>();

  readonly sidebarClasses = computed(() => ({
    'is-collapsed': this.collapsed(),
  }));
}
