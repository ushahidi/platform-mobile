import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'value-text',
  templateUrl: 'value.html',
  inputs: ['attribute', 'value', 'media']
})
export class ValueComponent {

  key: string = "AIzaSyBjDgMqF6GOdirXn3iFtI6Jlt8jEoWhSq4";
  attribute: any;
  value: any;
  media: any;
  map: string = null;

  constructor() {
  }

  ngOnInit() {
    console.log(`Value ${JSON.stringify(this.attribute)} ${JSON.stringify(this.value)}`);
    if (this.attribute.input == 'location' && this.value) {
      let coordinates = this.value.value;
      this.map = `https://maps.googleapis.com/maps/api/staticmap`
        + `?center=${coordinates}`
        + `&zoom=15&size=300x200&maptype=roadmap&markers=color:red%7C`
        + `${coordinates}&key=${this.key}`;
      console.log(`Map ${this.map}`);
    }
  }

}
