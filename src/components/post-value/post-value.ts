import { Component, Output, EventEmitter } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { StaticMap } from '../../maps/static-map';

import { Post } from '../../models/post';

import { LoggerService } from '../../providers/logger-service';
import { DatabaseService } from '../../providers/database-service';

import { PLACEHOLDER_NAME, PLACEHOLDER_PHOTO, PLACEHOLDER_MAP } from '../../constants/placeholders';

@Component({
  selector: 'post-value',
  templateUrl: 'post-value.html',
  inputs: ['value', 'mapToken', 'mapPins']
})
export class PostValueComponent {

  value:any = null;
  map:string = null;
  mapPins:boolean = true;
  mapToken:string = null;
  video:SafeResourceUrl = null;
  mapPlaceholder:string = PLACEHOLDER_MAP;
  photoPlaceholder:string = PLACEHOLDER_PHOTO;
  namePlaceholder:string = PLACEHOLDER_NAME;
  showValue:boolean = true;
  posts:Post[] = [];

  @Output()
  showLocation = new EventEmitter();

  @Output()
  showImage = new EventEmitter();

  @Output()
  showResponse = new EventEmitter();

  constructor(
    private logger:LoggerService,
    private database:DatabaseService,
    private sanitizer:DomSanitizer) {
  }

  ngOnInit() {
    this.logger.info(this, "Value", this.value);
    if (this.value == null) {
      this.showValue = false;
    }
    else if (this.value.type == 'title') {
      this.showValue = false;
    }
    else if (this.value.type == 'description') {
      this.showValue = false;
    }
    else if (this.value.response_private == true) {
      this.showValue = false;
    }
    else if (this.value.show_when_published == true) {
      this.showValue = true;
    }
    else {
      this.showValue = true;
    }
    if (this.value && this.value.input == 'location') {
      this.loadMapSrc(this.value.value);
    }
    else if (this.value && this.value.input == 'video') {
      this.loadVideoSrc(this.value.value);
    }
    else if (this.value && this.value.input == 'relation') {

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
        let staticMap = new StaticMap(this.mapToken, latitude, longitude);
        this.map = staticMap.getUrl(this.mapPins);
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

  postClicked(post:Post) {
    this.logger.info(this, "postClicked", post);
    if (post) {
      this.showResponse.emit({
        post: post });
    }
  }

}
