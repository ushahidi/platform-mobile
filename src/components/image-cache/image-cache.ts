import { Injectable, Component, Input, OnInit, OnChanges, AfterContentChecked } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Md5 } from 'ts-md5/dist/md5';

import { Transfer, TransferObject } from '@ionic-native/transfer';
import { File, Entry, FileEntry, FileError, Metadata } from '@ionic-native/file';

import { LoggerService } from '../../providers/logger-service';

declare var cordova:any;

@Component({
  selector: 'image-cache',
  template: `<div class="image-cache"><img [src]="placeholder" *ngIf="placeholder"><img class="fadein" [src]="safeUrl" *ngIf="safeUrl" /></div>`
})
@Injectable()
export class ImageCacheComponent implements OnInit, OnChanges, AfterContentChecked {

  @Input('src')
  src:string = null;

  @Input('fallback')
  fallback:string = null;

  @Input('placeholder')
  placeholder:string = null;

  cacheUrl:string = null;

  safeUrl:SafeUrl = null;

  constructor(
    private file:File,
    private transfer:Transfer,
    private sanitizer:DomSanitizer,
    private logger:LoggerService) {
  }

  ngOnInit() {
    this.loadCacheImage(this.src);
  }

  ngOnChanges() {
    this.loadCacheImage(this.src);
  }

  ngAfterContentChecked() {
    this.reloadCacheImage(this.src);
  }

  loadCacheImage(url:string) {
    if (url && url.length > 0) {
      this.logger.info(this, "loadCacheImage", url);
      this.fetchCacheImage(url).then(
        (cache:string) => {
          this.useCacheImage(cache).then(
            (file:any) => {
              this.logger.info(this, "loadCacheImage", url, file);
            },
            (error:any) => {
              this.logger.error(this, "loadCacheImage", url, error);
              this.useFallback();
          });
        },
        (error:any) => {
          this.logger.error(this, "loadCacheImage", url, error);
          this.useFallback();
        });
    }
    else {
      this.useFallback();
    }
  }

  reloadCacheImage(url:string) {
    if (this.cacheUrl && this.cacheUrl.length > 0) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.cacheUrl);
    }
  }

  fetchCacheImage(url:string) {
    return new Promise((resolve, reject) => {
      let file = this.getCacheFile(url);
      let directory = this.getCacheDirectory();
      this.hasCacheImage(url, directory, file).then(
        (cache:string) => {
          this.logger.info(this, "fetchCacheImage", url, cache);
          resolve(cache);
        },
        (none:any) => {
          this.downloadCacheImage(url, directory, file).then(
            (cache:string) => {
              this.logger.info(this, "fetchCacheImage", url, cache);
              resolve(cache);
            },
            (error:any) => {
              this.logger.error(this, "fetchCacheImage", url, error);
              reject(error);
          });
        });
    });
  }

  hasCacheImage(image:string, directory:string, cache:string):Promise<string> {
    return new Promise((resolve, reject) => {
      this.file.checkFile(directory, cache).then(
        (exists:boolean) => {
          if (exists) {
            let url = directory + cache;
            this.file.resolveLocalFilesystemUrl(url).then(
              (entry:FileEntry) => {
                entry.getMetadata((metadata:Metadata) => {
                  this.logger.info(this, "hasCacheImage", "Yes", cache);
                  if (metadata.size > 0) {
                    resolve(entry.toURL());
                  }
                  else {
                    reject("Cache Empty");
                  }
                });
              },
              (error:FileError) => {
                this.logger.error(this, "hasCacheImage", "Yes", cache, error);
                reject(error);
            });
          }
          else {
            this.logger.info(this, "hasCacheImage", "No", cache);
            reject("No Cache");
          }
        },
        (error:FileError) => {
          this.logger.info(this, "hasCacheImage", "No", cache);
          reject(error);
      });
    });
  }

  downloadCacheImage(image:string, directory:string, cache:string):Promise<string> {
    return new Promise((resolve, reject) => {
      let url = directory + cache;
      let fileTransfer:TransferObject = this.transfer.create();
      fileTransfer.download(image, url, true).then(
        (entry:Entry) => {
          this.logger.info(this, "downloadCacheImage", image, url, entry.toURL());
          resolve(entry.toURL());
        },
        (error:any) => {
          this.logger.error(this, "downloadCacheImage", image, url, error);
          reject(error);
      });
    });
  }

  useCacheImage(url:string):Promise<string> {
    return new Promise((resolve, reject) => {
      this.file.resolveLocalFilesystemUrl(url).then(
        (entry:FileEntry) => {
          this.logger.info(this, "useCacheImage", url, entry.toInternalURL());
          this.cacheUrl = entry.toInternalURL();
          this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(entry.toInternalURL());
          resolve(entry.toInternalURL());
        },
        (error:any) => {
          this.logger.error(this, "useCacheImage", url, error);
          reject(error);
      });
    });
  }

  useFallback() {
    if (this.fallback && this.fallback.length > 0) {
      this.logger.info(this, "useFallback", this.fallback);
      this.cacheUrl = this.fallback;
      this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.fallback);
    }
  }

  getCacheFile(url:string):string {
    let hash = Md5.hashStr(url);
    if (url.indexOf(".jpg") != -1) {
      return hash.toString() + ".jpg";
    }
    else if (url.indexOf(".jpeg") != -1) {
      return hash.toString() + ".jpeg";
    }
    else if (url.indexOf(".png") != -1) {
      return hash.toString() + ".png";
    }
    else if (url.indexOf(".gif") != -1) {
      return hash.toString() + ".gif";
    }
    return hash.toString() + ".jpg";
  }

  getCacheDirectory():string {
    return cordova.file.cacheDirectory;
  }

}
