import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySeparatorFormatter',
})
export class CurrencySeparatorFormatterPipe implements PipeTransform {
  transform(value: string | null): string | undefined {
    return value
      ?.replace(/,/g, 'x')
      .replace(/\./g, ',')
      .replace(/x/g, '.')
      .replace(/\$/g, '$ ');
  }
}
