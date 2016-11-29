import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'niceNumber'
})
@Injectable()
export class NiceNumber {
  transform(value: string, args: any[]) {
    if (value != null) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return "";
  }
}
