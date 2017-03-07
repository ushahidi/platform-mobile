import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

export class Layer {

  constructor() {
  }

  getUrl() {
    let url = `https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=${MAPBOX_ACCESS_TOKEN}`;
    console.log(url);
    return url;
  }
}
