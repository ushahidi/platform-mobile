import { Component, ElementRef, Input } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Transfer, File, Entry, FileError } from 'ionic-native';

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

  url:string = null;
  cache:SafeUrl = null;
  image:HTMLImageElement = null;

  constructor(private element:ElementRef, public sanitizer:DomSanitizer, private logger:LoggerService) {
  }

  ngOnInit() {
    this.image = this.element.nativeElement.querySelector('img');
    this.image.crossOrigin = 'Anonymous';
    this.loadCacheImage();
  }

  ngAfterContentChecked() {
    this.reloadCacheImage();
  }

  loadCacheImage() {
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
    if (this.url && this.url.length > 0) {
      this.logger.info(this, "reloadCacheImage", this.url);
      this.cache = this.sanitizer.bypassSecurityTrustUrl(this.url);
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
        (entry:Entry)=> {
          this.logger.info(this, "downloadCacheImage", "Downloaded", image, entry.toURL());
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
          this.cache = this.sanitizer.bypassSecurityTrustUrl(entry.toInternalURL());
          this.url = entry.toInternalURL();
          resolve(entry.toInternalURL());
      });
    });
  }

  getCacheFile(url:string):string {
    // let hash = 0;
    // if (url && url.length > 0) {
    //   let char;
    //   for (let i = 0; i < url.length; i++) {
    //     char = url.charCodeAt(i);
    //     hash = ((hash << 5) - hash) + char;
    //     hash = hash & hash;
    //   }
    // }
    // if (url.indexOf(".jpg") != -1) {
    //   return hash.toString() + ".jpg";
    // }
    // else if (url.indexOf(".png") != -1) {
    //   return hash.toString() + ".png";
    // }
    // return hash.toString() + ".jpg";
    if (url && url.length > 0) {
      let fileName = url.toLowerCase()
        .replace('jpg','')
        .replace('png','')
        .replace(/[\.]/g,'-')
        .replace(/[^\w\s-]/g,'-')
        .replace(/[\s_-]+/g,'-')
        .replace(/\-\-+/g,'-')
        .replace(/^-+|-+$/g,'');
      if (url.indexOf(".jpg") != -1) {
        return fileName + ".jpg";
      }
      else if (url.indexOf(".png") != -1) {
        return fileName + ".png";
      }
      return fileName + ".jpg";
    }
    return null;
  }

  getCacheDirectory():string {
    return cordova.file.cacheDirectory;
  }

  onCacheStarted() {
    if (this.placeholder && this.placeholder.length > 0) {
      this.cache = this.placeholder;
    }
    else {
      this.image.classList.add("cache-loading");
    }
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
