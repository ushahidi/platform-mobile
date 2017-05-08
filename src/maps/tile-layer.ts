import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

export class TileLayer {

  mapToken:string;
  size:number = 256;
  version:string = "-v9";
  style:string = "streets";

  constructor(mapToken:string, style:string='streets', size:number=256, version:string="-v9") {
    this.mapToken = mapToken && mapToken.length > 0 ? mapToken : MAPBOX_ACCESS_TOKEN;
    this.style = style;
    this.size = size;
    this.version = version;
  }

  getUrl() {
    let url = `https://api.mapbox.com/styles/v1/mapbox/${this.style}${this.version}/tiles/${this.size}/{z}/{x}/{y}?access_token=${this.mapToken}`;
    console.log(`TileLayer ${url}`);
    return url;
  }
}
