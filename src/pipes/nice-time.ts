import { Injectable, Pipe } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'niceTime'
})
@Injectable()
export class NiceTime {
  transform(value: string, args: any[]) {
    var date = new Date(value);
    if (args != null && args.toString() == 'ago') {
      var now = new Date();
      var ONE_DAY = 24 * 60 * 60 * 1000;
      if ((now.getTime() - date.getTime()) < ONE_DAY * 2) {
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
      return moment(date).format("D MMM YYYY");
    }
    if (args != null && args.length > 0) {
      return moment(date).format(args[0]);
    }
    return moment(date).format("D MMM YYYY");
  }
}
