import { Component } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'value-text',
  templateUrl: 'value.html',
  inputs: ['value']
})
export class ValueComponent {

  key: string = "AIzaSyBjDgMqF6GOdirXn3iFtI6Jlt8jEoWhSq4";
  value: any;
  map: string = null;
  video: SafeResourceUrl = null;

  constructor(
    public logger:LoggerService,
    public sanitizer:DomSanitizer) {
  }

  ngOnInit() {
    this.logger.info(this, "Value", this.value);
    if (this.value.input == 'location') {
      let coordinates = this.value.value;
      this.map = `https://maps.googleapis.com/maps/api/staticmap`
        + `?center=${coordinates}`
        + `&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C`
        + `${coordinates}&key=${this.key}`;
      this.logger.info(this, "Map", this.map);
    }
    else if (this.value.input == 'video') {
      this.video = this.sanitizer.bypassSecurityTrustResourceUrl(this.value.value);
    }
  }

}
