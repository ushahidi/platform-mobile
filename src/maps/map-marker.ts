import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

export class MapMarker {

  mapToken:string;
  pin:string = "pin-m";
  color:string = "207AC9";

  constructor(mapToken:string, color:string="207AC9", pin:string="pin-m") {
    this.mapToken = mapToken && mapToken.length > 0 ? mapToken : MAPBOX_ACCESS_TOKEN;
    this.color = color ? color.replace("#",'') : "207AC9";
    this.pin = pin;
  }

  getUrl() {
    let url = `https://api.mapbox.com/v4/marker/${this.pin}+${this.color}.png?access_token=${this.mapToken}`;
    console.log(`MapMarker ${url}`);
    return url;
  }
}
