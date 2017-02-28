import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'truncate'
})
@Injectable()
export class TruncatePipe {
  transform(value:string, args:number=20) {
    let limit = args ? args : 10;
    let words = value.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ").concat(" ...");
    }
    return words.slice(0, limit).join(" ");
  }
}
