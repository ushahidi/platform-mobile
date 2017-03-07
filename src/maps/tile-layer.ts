import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

export class TileLayer {

  size:number = 256;
  version:string = "-v9";
  style:string = "streets";

  constructor(style:string='streets', size:number=256, version:string="-v9") {
    this.style = style;
    this.size = size;
    this.version = version;
  }

  getUrl() {
    let url = `https://api.mapbox.com/styles/v1/mapbox/${this.style}${this.version}/tiles/${this.size}/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`;
    console.log(url);
    return url;
  }
}
