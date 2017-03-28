import { Component, ElementRef, Input, OnInit, AfterContentChecked } from '@angular/core';
import { Transfer, File, Entry, FileEntry, FileError, Metadata } from 'ionic-native';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Md5 } from 'ts-md5/dist/md5';

import { LoggerService } from '../../providers/logger-service';

declare var cordova:any;

@Component({
  selector: 'image-cache',
  template: `<div class="image-cache"><img [src]="placeholder" *ngIf="placeholder"><img class="fadein" [src]="safeUrl" *ngIf="safeUrl" /></div>`
})
export class ImageCacheComponent implements OnInit, AfterContentChecked {

  @Input('src')
  src:string = null;

  @Input('placeholder')
  placeholder:string = null;

  cacheUrl:string = null;

  safeUrl:SafeUrl = null;

  constructor(
    private element:ElementRef,
    private sanitizer:DomSanitizer,
    private logger:LoggerService) {
  }

  ngOnInit() {
    this.loadCacheImage();
  }

  ngAfterContentChecked() {
    this.reloadCacheImage();
  }

  loadCacheImage() {
    if (this.src && this.src.length > 0) {
      this.logger.info(this, "loadCacheImage", this.src);
      let cache = this.getCacheFile(this.src);
      let directory = this.getCacheDirectory();
      this.hasCacheImage(directory, cache).then(
        (exists:boolean) => {
          this.useCacheImage(directory, cache).then(
            (file:any) => {
              this.logger.info(this, "loadCacheImage", this.src, file);
            },
            (error:any) => {
              this.logger.error(this, "loadCacheImage", this.src, error);
          });
        },
        (missing:boolean) => {
          this.downloadCacheImage(this.src, directory, cache).then(
            (url:string) => {
              this.useCacheImage(directory, cache).then(
                (file:any) => {
                  this.logger.info(this, "loadCacheImage", this.src, file);
                },
                (error:any) => {
                  this.logger.error(this, "loadCacheImage", this.src, error);
              });
            },
            (error:any) => {
              this.logger.error(this, "loadCacheImage", this.src, error);
          });
        });
    }
  }

  reloadCacheImage() {
    if (this.cacheUrl && this.cacheUrl.length > 0) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.cacheUrl);
    }
  }

  hasCacheImage(directory:string, cache:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      let url = directory + cache;
      File.checkFile(directory, cache).then(
        (exists:boolean) => {
          if (exists) {
            File.resolveLocalFilesystemUrl(url).then(
              (entry:FileEntry) => {
                entry.getMetadata((metadata:Metadata) => {
                  this.logger.info(this, "hasCacheImage", "Yes", cache, metadata);
                  if (metadata.size > 0) {
                    resolve(true);
                  }
                  else {
                    reject(false);
                  }
                });
              },
              (error:FileError) => {
                this.logger.error(this, "hasCacheImage", "Yes", cache, error);
                reject(false);
            });
          }
          else {
            this.logger.info(this, "hasCacheImage", "No", cache);
            reject(false);
          }
        },
        (error:FileError) => {
          this.logger.info(this, "hasCacheImage", "No", cache);
          reject(false);
      });
    });
  }

  downloadCacheImage(image:string, directory:string, cache:string):Promise<string> {
    return new Promise((resolve, reject) => {
      let url = directory + cache;
      let fileTransfer = new Transfer();
      fileTransfer.download(image, url, true).then(
        (entry:Entry) => {
          this.logger.info(this, "downloadCacheImage", image, url, entry);
          resolve(entry.toURL());
        },
        (error:any) => {
          this.logger.error(this, "downloadCacheImage", image, url, error);
          reject(error);
      });
    });
  }

  useCacheImage(directory:string, cache:string):Promise<any> {
    return new Promise((resolve, reject) => {
      let url = directory + cache;
      File.resolveLocalFilesystemUrl(url).then(
        (entry:FileEntry) => {
          this.logger.info(this, "useCacheImage", url, entry);
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
