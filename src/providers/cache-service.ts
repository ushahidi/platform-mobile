import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Platform } from 'ionic-angular';

import { HTTP } from '@ionic-native/http';
import { File } from '@ionic-native/file';

import { StaticMap } from '../maps/static-map';
import { ImageCacheComponent } from '../components/image-cache/image-cache';

import { LoggerService } from '../providers/logger-service';
import { SettingsService } from '../providers/settings-service';

@Injectable()
export class CacheService {

  private broken:any = {}
  private promise:Promise<any> = null;
  private promises:Promise<any>[] = [];
  private imageCache:ImageCacheComponent = null;
  private mapPins:boolean = true;

  constructor(
    private platform:Platform,
    private file:File,
    private http:HTTP,
    private sanitizer:DomSanitizer,
    private logger:LoggerService,
    private settings:SettingsService) {
    this.imageCache = new ImageCacheComponent(platform, file, http, sanitizer, logger);
    this.settings.getMapMarkerPins().then((mapPins:boolean) => {
      this.mapPins = mapPins;
    });
  }

  fetchImage(url:string) {
    if (url && url.length > 0) {
      this.logger.info(this, "fetchImage", url);
      if (this.broken[url]) {
        this.logger.info(this, "fetchImage", url, "Image Broken");
      }
      else {
        this.promises.push(this.imageCache.fetchCacheImage(url));
        this.fetchNext();
      }
    }
  }

  fetchMap(mapToken:string, latitude:number, longitude:number) {
    if (latitude != null && longitude != null) {
      this.logger.info(this, "fetchMap", mapToken, latitude, longitude);
      let staticMap = new StaticMap(mapToken, latitude, longitude);
      let url = staticMap.getUrl(this.mapPins);
      if (this.broken[url]) {
        this.logger.info(this, "fetchMap", url, "Map Broken");
      }
      else {
        this.promises.push(this.imageCache.fetchCacheImage(url));
        this.fetchNext();
      }
    }
  }

  fetchNext() {
    if (this.promise) {
      //WAIT UNTIL CURRENT PROMISE HAS COMPLETED
    }
    else if (this.promises.length > 0) {
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
          if (error.source) {
            this.broken[error.source] = "Broken";
          }
          this.promises.splice(0, 1);
          this.promise = null;
          this.fetchNext();
        }
      );
    }
  }

}
