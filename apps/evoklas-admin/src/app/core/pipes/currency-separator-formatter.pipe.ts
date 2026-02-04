import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySeparatorFormatter'
})
export class CurrencySeparatorFormatterPipe implements PipeTransform {
  transform(value: string|null): string|undefined {
    return value?.replace(/,/gi, "x")
                .replace(/\./gi, ",")
                .replace(/x/gi, ".")
                .replace(/\$/gi, "$ ");
  }
}