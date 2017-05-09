import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'htmlStrip'
})
@Injectable()
export class HtmlStripPipe {

  transform(value, args) {
    value = value + '';
    return value.replace(/<(?:.|\n)*?>/gm, '');
  }
}
