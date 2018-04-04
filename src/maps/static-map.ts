import { MAPBOX_ACCESS_TOKEN } from '../constants/secrets';

import { MapMarker } from './map-marker';

export class StaticMap {

  mapToken:string;
  zoom:number = 14;
  color:string = "207AC9";
  latitude:number = null;
  longitude:number = null;
  width:number = 400;
  height:number = 300;
  style:string = "streets";
  version:string = "-v9";

  constructor(mapToken:string, latitude:number, longitude:number, width:number=400, height:number=300, zoom:number=14, color:string="207AC9", style:string="streets") {
    this.mapToken = mapToken && mapToken.length > 0 ? mapToken : MAPBOX_ACCESS_TOKEN;
    this.latitude = latitude;
    this.longitude = longitude;
    this.width = width;
    this.height = height;
    this.zoom = zoom;
    this.color = color;
    this.style = style;
  }

  public getUrl(pin:boolean=true) {
    if (pin) {
      let marker = new MapMarker(this.mapToken, this.color).getUrl();
      let url = `https://api.mapbox.com/styles/v1/mapbox/${this.style}${this.version}/static/` +
              `url-${encodeURIComponent(marker)}(${this.longitude},${this.latitude})/` +
              `${this.longitude},${this.latitude},${this.zoom}/`+
              `${this.width}x${this.height}?access_token=${this.mapToken}`;
      console.log(`StaticMap ${url}`);
      return url;
    }
    else {
      let center = [this.longitude, this.latitude];
      let radius = 250;
      let points = 32;
      let geojson = this.circleToPolygon(center, radius, points);
      let url = `https://api.mapbox.com/styles/v1/mapbox/${this.style}${this.version}/static/` +
              `geojson(${JSON.stringify(geojson)})/` +
              `${this.longitude},${this.latitude},${this.zoom}/`+
              `${this.width}x${this.height}?access_token=${this.mapToken}`;
      console.log(`StaticMap ${url}`);
      return url;
    }
  }

  private circleToPolygon(center, radius, points) {
    let n = points ? points : 32;
    let flatCoordinates = [];
    let coordinates = [];
    for (let i = 0; i < n; ++i) {
      flatCoordinates.push.apply(flatCoordinates, this.toOffset(center, radius, 2 * Math.PI * i / n));
    }
    flatCoordinates.push(flatCoordinates[0], flatCoordinates[1]);
    for (let i = 0, j = 0; j < flatCoordinates.length; j += 2) {
      coordinates[i++] = flatCoordinates.slice(j, j + 2);
    }
    return {
      type: 'Polygon',
      coordinates: [coordinates.reverse()]
    };
  };

  private toRadians(angleInDegrees) {
    return angleInDegrees * Math.PI / 180;
  }

  private toDegrees(angleInRadians) {
    return angleInRadians * 180 / Math.PI;
  }

  private toOffset(c1, distance, bearing) {
    let lat1 = this.toRadians(c1[1]);
    let lon1 = this.toRadians(c1[0]);
    let dByR = distance / 6378137;
    let lat = Math.asin(
      Math.sin(lat1) * Math.cos(dByR) +
      Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing));
    let lon = lon1 + Math.atan2(
        Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
        Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat));
    return [this.toDegrees(lon), this.toDegrees(lat)];
  }
}
