import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

export class TileLayer {

  style:string = "mapbox.streets";

  constructor(style:string='mapbox.streets') {
    this.style = style;
  }

  getUrl() {
    return `https://api.tiles.mapbox.com/v4/${this.style}/{z}/{x}/{y}.png?access_token=${MAPBOX_ACCESS_TOKEN}`;
  }
}
