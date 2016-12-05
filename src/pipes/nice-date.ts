import { Injectable, Pipe } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'niceDate'
})
@Injectable()
export class NiceDate {
  transform(value: string, args: any[]) {
    var date = new Date(value);
    moment.locale('en', {
        relativeTime : {
            future: "in %s",
            past:   "%s ago",
            s:  "seconds",
            m:  "1 minute",
            mm: "%d minutes",
            h:  "1 hour",
            hh: "%d hours",
            d:  "1 day",
            dd: "%d days",
            M:  "1 month",
            MM: "%d months",
            y:  "1 year",
            yy: "%d years"
        }
    });
    return moment(date).fromNow();
  }
}
