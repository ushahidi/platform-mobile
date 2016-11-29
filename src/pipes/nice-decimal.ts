import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'niceDecimal'
})
@Injectable()
export class NiceDecimal {
  transform(value: string, args: any[]) {
    let num = parseFloat(value+'e1');
    return Number(Math.round(num)+'e-1');
  }
}
