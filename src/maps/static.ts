import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

import { Marker } from './marker';

export class Static {

  zoom:number = 13;
  color:string = "207AC9";
  latitude:number = null;
  longitude:number = null;
  width:number = 400;
  height:number = 300;

  constructor(latitude:number, longitude:number, color:string="207AC9", width:number=400, height:number=300, zoom:number=13) {
    this.zoom = zoom;
    this.color = color;
    this.width = width;
    this.height = height;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  getUrl() {
    let marker = new Marker(this.color).getUrl();
    let url = `https://api.mapbox.com/styles/v1/mapbox/streets-v8/static/` +
           `url-${encodeURIComponent(marker)}(${this.longitude},${this.latitude})/` +
           `${this.longitude},${this.latitude},${this.zoom}/${this.width}x${this.height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
    console.log(url);
    return url;
  }
}
