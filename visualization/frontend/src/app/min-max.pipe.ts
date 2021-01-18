import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minMax'
})
export class MinMaxPipe implements PipeTransform {

  transform(value: {min?: number, max?: number}): string {
    if(value.min === undefined || value.max === undefined) {
      return '';
    }
    return ` (${value.min} - ${value.max}) `;
  }
}
