import { Injectable, Pipe } from '@angular/core';

@Pipe({
  name: 'htmlParse'
})
@Injectable()
export class HtmlParsePipe {
  transform(value: string, args: any[]) {
    if (value.indexOf("href=") != -1) {
      let regex = /href="(.*?)"/gim;
      let html = value.replace(regex, 'href="$1" target="_blank"');
      return html;
    }
    else {
      let regex1 = /(\b(http|https):\/\/[-A-Z0-9+&#\/%?=~_|!:,.;]*[-A-Z0-9+&#\/%=~_|])/gim;
      let html = value.replace(regex1, '<a href="$1" target="_blank">$1</a>');

      let regex2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      html = html.replace(regex2, '$1<a href="http://$2" target="_blank">$2</a>');

      let regex3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
      html = html.replace(regex3, '<a href="mailto:$1" target="_system">$1</a>');
      return html;
    }
  }

}
