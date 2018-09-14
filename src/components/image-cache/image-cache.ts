import { Injectable, Component, Input, OnInit, OnChanges, AfterContentChecked } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Md5 } from 'ts-md5/dist/md5';
import { Platform, normalizeURL } from 'ionic-angular';

import { HTTP } from '@ionic-native/http';
import { File, Entry, FileEntry, FileError, Metadata } from '@ionic-native/file';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'image-cache',
  templateUrl: 'image-cache.html'
})
@Injectable()
export class ImageCacheComponent implements OnInit, OnChanges, AfterContentChecked {

  @Input('src')
  src:string = null;

  @Input('fallback')
  fallback:string = null;

  @Input('placeholder')
  placeholder:string = null;

  original:string = null;

  cacheUrl:string = null;

  safeUrl:SafeUrl|string = null;

  constructor(
    private platform:Platform,
    private file:File,
    private http:HTTP,
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

  public loadCacheImage(url:string) {
    if (url && url.length > 0 && url !== this.original) {
      this.original = url;
      this.fetchCacheImage(url).then((cache:string) => {
        this.logger.info(this, "loadCacheImage", url, "Cache", cache);
        this.useCacheImage(cache).then((file:any) => {
          this.logger.info(this, "loadCacheImage", url, "Cache", cache, "File", file);
        },
        (error:any) => {
          this.logger.warn(this, "loadCacheImage", url, "Cache", cache, "Error", error);
          this.useFallback();
        });
      },
      (error:any) => {
        this.logger.warn(this, "loadCacheImage", url, "Error", error);
        this.useFallback();
      });
    }
    else {
      this.useFallback();
    }
  }

  public reloadCacheImage(url:string) {
    if (this.cacheUrl && this.cacheUrl.length > 0) {
      if (this.cacheUrl === this.original) {
        this.safeUrl = this.original;
      }
      else {
        this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.cacheUrl);
      }
    }
  }

  public fetchCacheImage(url:string):Promise<string> {
    return new Promise((resolve, reject) => {
      let file = this.getCacheFile(url);
      let directory = this.getCacheDirectory();
      this.hasCacheImage(url, directory, file).then((cache:string) => {
        this.logger.info(this, "fetchCacheImage", url, cache);
        resolve(cache);
      },
      (none:any) => {
        this.logger.warn(this, "fetchCacheImage", url, none);
        this.downloadCacheImage(url, directory, file).then((cache:string) => {
          this.logger.info(this, "fetchCacheImage", url, cache);
          resolve(cache);
        },
        (error:any) => {
          this.logger.warn(this, "fetchCacheImage", url, error);
          reject(error);
        });
      });
    });
  }

  public hasCacheImage(url:string, directory:string, file:string):Promise<string> {
    return new Promise((resolve, reject) => {
      this.file.checkFile(directory, file).then((exists:boolean) => {
        if (exists) {
          this.file.resolveLocalFilesystemUrl(directory + file).then((entry:FileEntry) => {
            entry.getMetadata((metadata:Metadata) => {
              if (metadata.size > 0) {
                this.logger.info(this, "hasCacheImage", url, "Yes", entry.toURL());
                resolve(entry.toURL());
              }
              else {
                this.logger.info(this, "hasCacheImage", url, "No", "Empty");
                reject("Cache Empty");
              }
            },
            (error:any) => {
              this.logger.warn(this, "hasCacheImage", url, "No", error);
              reject("No Cache");
            });
          },
          (error:FileError) => {
            this.logger.warn(this, "hasCacheImage", url, "No", error);
            reject("No Cache");
          });
        }
        else {
          this.logger.info(this, "hasCacheImage", url, "No", exists);
          reject("No Cache");
        }
      },
      (error:FileError) => {
        this.logger.info(this, "hasCacheImage", url, "No");
        reject("No Cache");
      });
    });
  }

  public downloadCacheImage(url:string, directory:string, file:string):Promise<string> {
    return new Promise((resolve, reject) => {
      let filePath = directory + file;
      this.logger.info(this, "downloadCacheImage", url, filePath);
      this.http.disableRedirect(false);
      this.http.setRequestTimeout(10.0);
      this.http.downloadFile(url, {}, {}, filePath).then((entry:any) => {
        this.logger.info(this, "downloadCacheImage", url, filePath, entry);
        resolve(entry.toURL());
      },
      (error:any) => {
        this.logger.error(this, "downloadCacheImage", url, filePath, error);
        reject(error);
      });
    });
  }

  private useCacheImage(url:string):Promise<string> {
    return new Promise((resolve, reject) => {
      this.resolveFilePath(url).then((file:string) => {
        this.logger.info(this, "useCacheImage", url, file);
        this.cacheUrl = file;
        this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(file);
        resolve(file);
      },
      (error:any) => {
        this.logger.warn(this, "useCacheImage", url, error);
        this.cacheUrl = null;
        this.safeUrl = null;
        reject(error);
      });
    });
  }

  private resolveFilePath(url:string):Promise<string> {
    return new Promise((resolve, reject) => {
      this.file.resolveLocalFilesystemUrl(url).then((fileEntry:FileEntry) => {
        let normalizedURL = this.platform.is("ios")
          ? normalizeURL(fileEntry.toURL())
          : normalizeURL(fileEntry.toInternalURL());
        this.logger.info(this, "resolveFilePath", url, normalizedURL);
        resolve(normalizedURL);
      },
      (error:any) => {
        this.logger.warn(this, "resolveFilePath", url, error);
        reject(error);
      });
    });
  }

  private useFallback() {
    if (this.original && this.original.length > 0) {
      this.logger.info(this, "useFallback", "Original", this.original);
      this.cacheUrl = this.original;
      this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.original);
    }
    else if (this.fallback && this.fallback.length > 0) {
      this.logger.info(this, "useFallback", "Fallback", this.fallback);
      this.cacheUrl = normalizeURL(this.fallback);
      this.safeUrl = this.sanitizer.bypassSecurityTrustUrl(this.fallback);
    }
    else {
      this.logger.info(this, "useFallback", "None");
      this.cacheUrl = null;
      this.safeUrl = null;
    }
  }

  private getCacheFile(url:string):string {
    let hash = Md5.hashStr(url);
    let lowercase = url.toLowerCase();
    if (lowercase.indexOf(".jpg") > 0) {
      return hash.toString() + ".jpg";
    }
    else if (lowercase.indexOf(".jpeg") > 0) {
      return hash.toString() + ".jpeg";
    }
    else if (lowercase.indexOf(".png") > 0) {
      return hash.toString() + ".png";
    }
    else if (lowercase.indexOf(".gif") > 0) {
      return hash.toString() + ".gif";
    }
    return hash.toString() + ".jpg";
  }

  private getCacheDirectory():string {
    if (this.platform.is("ios")) {
      return this.file.cacheDirectory;
    }
    else if (this.platform.is("android")) {
      return this.file.dataDirectory;
    }
    return this.file.cacheDirectory;
  }

}
