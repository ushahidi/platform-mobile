import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'niceTitle'
})
@Injectable()
export class NiceTitle {
  transform(value: string, args: any[]) {
    return value.toString().toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
      return c.toUpperCase();
    });
  }
}
