export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  description?: string;
  badge?: string | number;
  disabled?: boolean;
}
