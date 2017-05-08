import { Component, Output, EventEmitter } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { StaticMap } from '../../maps/static-map';

import { LoggerService } from '../../providers/logger-service';

import { PLACEHOLDER_PHOTO, PLACEHOLDER_MAP } from '../../constants/placeholders';

@Component({
  selector: 'post-value',
  templateUrl: 'post-value.html',
  inputs: ['value', 'mapToken']
})
export class PostValueComponent {

  value: any;
  map: string = null;
  mapToken:string;
  video: SafeResourceUrl = null;
  mapPaceholder: string = PLACEHOLDER_MAP;
  photoPaceholder: string = PLACEHOLDER_PHOTO;

  @Output()
  showLocation = new EventEmitter();

  @Output()
  showImage = new EventEmitter();

  constructor(
    public logger:LoggerService,
    public sanitizer:DomSanitizer) {
  }

  ngOnInit() {
    this.logger.info(this, "Value", this.value);
    if (this.value && this.value.input == 'location') {
      this.loadMapSrc(this.value.value);
    }
    else if (this.value && this.value.input == 'video') {
      this.loadVideoSrc(this.value.value);
    }
  }

  ngAfterContentChecked() {
    if (this.value && this.value.value && this.value.input == 'location' && this.map == null) {
      this.loadMapSrc(this.value.value);
    }
    else if (this.value && this.value.value && this.value.input == 'video' && this.video == null) {
      this.loadVideoSrc(this.value.value);
    }
  }

  loadMapSrc(coordinates:string) {
    if (coordinates && coordinates.length > 0) {
      let location = coordinates.split(",");
      if (location && location.length > 1) {
        let latitude = Number(location[0]);
        let longitude = Number(location[1]);
        this.map = new StaticMap(this.mapToken, latitude, longitude).getUrl();
      }
      else {
        this.map = null;
      }
    }
    else {
      this.map = null;
    }
  }

  loadVideoSrc(url:string) {
    this.logger.info(this, "loadVideoSrc", url);
    if (url && url.length > 0) {
      this.video = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    else {
      this.video = null;
    }
  }

  locationClicked(coordinates:string) {
    this.logger.info(this, "locationClicked", coordinates);
    if (coordinates && coordinates.length > 1) {
      let components = coordinates.split(",");
      if (components && components.length > 1) {
        let latitude = Number(components[0]);
        let longitude = Number(components[1]);
        this.showLocation.emit({
          latitude: latitude,
          longitude: longitude });
      }
    }
  }

  imageClicked(url:string) {
    this.logger.info(this, "imageClicked", url);
    if (url) {
      this.showImage.emit({
        url: url });
    }
  }

}
