import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

export class MapMarker {

  pin:string = "pin-m";
  color:string = "207AC9";

  constructor(color:string="207AC9", pin:string="pin-m") {
    this.pin = pin;
    this.color = color ? color.replace("#",'') : "207AC9";
  }

  getUrl() {
    return `https://api.mapbox.com/v4/marker/${this.pin}+${this.color}.png?access_token=${MAPBOX_ACCESS_TOKEN}`;
  }
}
