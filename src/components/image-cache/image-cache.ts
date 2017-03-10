import { Component, ElementRef, Input } from '@angular/core';

import ImgCache from 'imgcache.js';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'image-cache',
  template: `<img class="image-cache" [src]="src" />`
})
export class ImageCacheComponent {

  @Input('src')
  src:string;

  @Input('placeholder')
  placeholder:string;

  img:HTMLImageElement;

  constructor(private element:ElementRef, private logger:LoggerService) {
  }

  ngOnInit() {
    this.img = this.element.nativeElement.querySelector('img');
    this.img.crossOrigin = 'Anonymous';
    if (this.src && this.src.length > 0) {
      this.logger.info(this, "Image", this.src, this.img.src);
      ImgCache.isCached(this.src, (path:string, success:boolean) => {
        if (success) {
          this.img.classList.add("lazy-loading");
          ImgCache.useCachedFile(this.img,
            () => {
              this.logger.info(this, "Use Cache", this.src, path);
              this.img.classList.add("lazy-loaded");
            },
            (error) => {
              this.logger.error(this, "Use Cache Error", this.src, error)
            });
        }
        else {
          if (this.placeholder && this.placeholder.length > 0) {
            this.src = this.placeholder;
          }
          else {
            this.img.classList.add("lazy-loading");
          }
          ImgCache.cacheFile(this.src,
            (cached) => {
              this.logger.info(this, "Add Cache", this.src, cached);
              this.src = cached;
              this.img.classList.add("lazy-loaded");
            },
            (error) => {
              this.logger.error(this, "Add Cache Error", this.src, error);
              if (this.placeholder && this.placeholder.length > 0) {
                this.src = this.placeholder;
                this.img.classList.add("lazy-loaded");
              }
              else {
                this.img.style.display = 'none';
              }
            });
        }
      });
    }
    else if (this.placeholder && this.placeholder.length > 0) {
      this.logger.info(this, "Placeholder", this.placeholder);
      this.src = this.placeholder;
    }
    else {
      this.logger.info(this, "Hide");
      this.img.style.display = 'none';
    }
  }

}
