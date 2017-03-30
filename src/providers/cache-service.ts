import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { StaticMap } from '../maps/static-map';
import { ImageCacheComponent } from '../components/image-cache/image-cache';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class CacheService {

  private promise:Promise<any> = null;
  private promises:Promise<any>[] = [];
  private imageCache:ImageCacheComponent = null;

  constructor(
    private sanitizer:DomSanitizer,
    private logger:LoggerService) {
    this.imageCache = new ImageCacheComponent(sanitizer, logger);
  }

  fetchImage(url:string) {
    if (url && url.length > 0) {
      this.logger.info(this, "fetchImage", url);
      this.promises.push(this.imageCache.fetchCacheImage(url));
    }
    this.fetchNext();
  }

  fetchMap(latitude:number, longitude:number) {
    if (latitude != null && longitude != null) {
      this.logger.info(this, "fetchMap", latitude, longitude);
      let staticMap = new StaticMap(latitude, longitude);
      this.promises.push(this.imageCache.fetchCacheImage(staticMap.getUrl()));
    }
    this.fetchNext();
  }

  fetchNext() {
    if (this.promise) {
      //WAIT UNTIL CURRENT PROMISE HAS COMPLETED
    }
    else if (this.promises.length > 0) {
      this.logger.info(this, "fetchNext", "Queue", this.promises.length);
      this.promise = this.promises[0];
      this.promise.then(
        (done:any) => {
          this.logger.info(this, "fetchNext", "Done", done);
          this.promises.splice(0, 1);
          this.promise = null;
          this.fetchNext();
        },
        (error:any) => {
          this.logger.error(this, "fetchNext", "Error", error);
          this.fetchNext();
        });
    }
    else {
      this.logger.info(this, "fetchNext", "Empty");
    }
  }

}
