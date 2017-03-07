import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

import { MapMarker } from './map-marker';

export class StaticMap {

  zoom:number = 14;
  color:string = "207AC9";
  latitude:number = null;
  longitude:number = null;
  width:number = 400;
  height:number = 300;
  style:string = "streets-v8";

  constructor(latitude:number, longitude:number, color:string="207AC9", width:number=400, height:number=300, zoom:number=14, style:string="streets-v8") {
    this.zoom = zoom;
    this.color = color;
    this.width = width;
    this.height = height;
    this.latitude = latitude;
    this.longitude = longitude;
    this.style = style;
  }

  getUrl() {
    let marker = new MapMarker(this.color).getUrl();
    return `https://api.mapbox.com/styles/v1/mapbox/${this.style}/static/` + 
           `url-${encodeURIComponent(marker)}(${this.longitude},${this.latitude})/` +
           `${this.longitude},${this.latitude},${this.zoom}/`+
           `${this.width}x${this.height}?access_token=${MAPBOX_ACCESS_TOKEN}`;
  }
}
