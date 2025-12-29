import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationItem } from '../../models/navigation-item';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  items = input.required<NavigationItem[]>();
  navigate = output<NavigationItem>();

  trackByPath = (_: number, item: NavigationItem): string => item.path;

  onNavigate(event: MouseEvent, item: NavigationItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    this.navigate.emit(item);
  }
}
