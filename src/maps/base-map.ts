import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

export class BaseMap {

  mapToken:string;
  zoom:number = 14;
  color:string = "207AC9";
  latitude:number = null;
  longitude:number = null;
  width:number = 400;
  height:number = 300;
  style:string = "streets";
  version:string = "-v9";

  constructor(mapToken:string, latitude:number, longitude:number, style:string="streets", color:string="207AC9", width:number=400, height:number=300, zoom:number=14) {
    this.mapToken = mapToken && mapToken.length > 0 ? mapToken : MAPBOX_ACCESS_TOKEN;
    this.zoom = zoom;
    this.color = color;
    this.width = width;
    this.height = height;
    this.latitude = latitude;
    this.longitude = longitude;
    this.style = style;
  }

  public getUrl() {
    let url = `https://api.mapbox.com/styles/v1/mapbox/${this.style}${this.version}/static/` +
              `${this.longitude},${this.latitude},${this.zoom}/`+
              `${this.width}x${this.height}?access_token=${this.mapToken}`;
    console.log(`BaseMap ${url}`);
    return url;
  }
}
