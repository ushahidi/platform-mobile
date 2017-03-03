import { Component } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { LoggerService } from '../../providers/logger-service';

import { GOOGLE_API_KEY } from '../../constants/secrets';
import { PLACEHOLDER_PHOTO, PLACEHOLDER_MAP } from '../../constants/placeholders';

@Component({
  selector: 'value-text',
  templateUrl: 'value.html',
  inputs: ['value']
})
export class ValueComponent {

  key: string = GOOGLE_API_KEY;
  value: any;
  map: string = null;
  video: SafeResourceUrl = null;
  mapPaceholder: string = PLACEHOLDER_MAP;
  photoPaceholder: string = PLACEHOLDER_PHOTO;

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
    if (this.value && this.value.input == 'location' && this.map == null) {
      this.loadMapSrc(this.value.value);
    }
    else if (this.value && this.value.input == 'video' && this.video == null) {
      this.loadVideoSrc(this.value.value);
    }
  }

  loadMapSrc(coordinates:string) {
    this.map = `https://maps.googleapis.com/maps/api/staticmap`
      + `?center=${coordinates}`
      + `&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C`
      + `${coordinates}&key=${this.key}`;
  }

  loadVideoSrc(url:string) {
    this.video = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
