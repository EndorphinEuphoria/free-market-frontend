import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clpFormat',
})
export class ClpFormatPipe implements PipeTransform {
  transform(value: number): string {
    return value.toLocaleString('es-CL');
  }
}
