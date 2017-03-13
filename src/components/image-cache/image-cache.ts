import { Component, ElementRef, Input } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Transfer, File, Entry, FileError } from 'ionic-native';
import { Md5 } from 'ts-md5/dist/md5';

import { LoggerService } from '../../providers/logger-service';

declare var cordova:any;

@Component({
  selector: 'image-cache',
  template: `<img class="image-cache" [src]="cache" />`
})
export class ImageCacheComponent {

  @Input('src')
  src:string;

  @Input('placeholder')
  placeholder:string;

  local:string = null;
  cache:SafeUrl = null;
  image:HTMLImageElement = null;

  constructor(private element:ElementRef, public sanitizer:DomSanitizer, private logger:LoggerService) {
  }

  ngOnInit() {
    this.loadCacheImage();
  }

  ngAfterContentChecked() {
    this.reloadCacheImage();
  }

  loadCacheImage() {
    this.image = this.element.nativeElement.querySelector('img');
    this.image.crossOrigin = 'Anonymous';
    if (this.src && this.src.length > 0) {
      this.logger.info(this, "loadCacheImage", "Image", this.src);
      let cache = this.getCacheFile(this.src);
      let directory = this.getCacheDirectory();
      this.onCacheStarted();
      this.hasCacheImage(directory, cache).then(
        (exists) => {
          this.useCacheImage(directory, cache).then((url) => {
            this.onCacheFinished();
          });
        },
        (missing) => {
          this.downloadCacheImage(this.src, directory, cache).then(
            (url) => {
              this.useCacheImage(directory, cache).then((url) => {
                this.onCacheFinished();
              });
            },
            (error) => {
              this.onCacheFailed();
          });
        });
    }
    else if (this.placeholder && this.placeholder.length > 0) {
      this.logger.info(this, "loadCacheImage", "Placeholder", this.placeholder);
      this.cache = this.placeholder;
    }
    else {
      this.logger.info(this, "loadCacheImage", "Hide");
      this.image.style.display = 'none';
    }
  }

  reloadCacheImage() {
    if (this.local && this.local.length > 0) {
      this.logger.info(this, "reloadCacheImage", this.local);
      this.cache = this.sanitizer.bypassSecurityTrustUrl(this.local);
    }
  }

  hasCacheImage(directory:string, cache:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      File.checkFile(directory, cache).then(
        (exists:boolean) => {
          if (exists) {
            this.logger.info(this, "hasCacheImage", "Cache", cache);
            resolve(true);
          }
          else {
            this.logger.info(this, "hasCacheImage", "No Cache", cache);
            reject(false);
          }
        },
        (error:FileError) => {
          this.logger.info(this, "hasCacheImage", "No Cache", cache);
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
          this.logger.info(this, "downloadCacheImage", "Downloaded", image, entry);
          resolve(entry.toURL());
        },
        (error:any) => {
          this.logger.error(this, "downloadCacheImage", "Failed", image, error);
          reject();
      });
    });
  }

  useCacheImage(directory:string, cache:string):Promise<string> {
    return new Promise((resolve, reject) => {
      let url = directory + cache;
      File.resolveLocalFilesystemUrl(url).then(
        (entry:Entry) => {
          this.logger.info(this, "useCacheImage", entry.toInternalURL());
          this.local = entry.toInternalURL();
          this.cache = this.sanitizer.bypassSecurityTrustUrl(entry.toInternalURL());
          resolve(entry.toInternalURL());
      });
    });
  }

  getCacheFile(url:string):string {
    let hash = Md5.hashStr(url);
    if (url.indexOf(".jpg") != -1) {
      return hash.toString() + ".jpg";
    }
    else if (url.indexOf(".png") != -1) {
      return hash.toString() + ".png";
    }
    return hash.toString() + ".jpg";
  }

  getCacheDirectory():string {
    return cordova.file.cacheDirectory;
  }

  onCacheStarted() {
    if (this.placeholder && this.placeholder.length > 0) {
      this.cache = this.placeholder;
    }
    this.image.classList.add("cache-loading");
  }

  onCacheFinished() {
    this.image.classList.add("cache-loaded");
  }

  onCacheFailed() {
    if (this.placeholder && this.placeholder.length > 0) {
      this.cache = this.placeholder;
    }
    else {
      this.image.style.display = 'none';
    }
    this.image.classList.add("cache-loaded");
  }

}
