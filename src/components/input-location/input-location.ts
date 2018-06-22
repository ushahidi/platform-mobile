import { NgZone, Component, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Http } from '@angular/http';

import { Device } from '@ionic-native/device';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';
import { NativeGeocoder, NativeGeocoderForwardResult } from '@ionic-native/native-geocoder';

import { BaseMap } from '../../maps/base-map';
import { StaticMap } from '../../maps/static-map';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';
import { Country } from '../../models/country';
import { Province } from '../../models/province';

import { LoggerService } from '../../providers/logger-service';
import { LanguageService } from '../../providers/language-service';

@Component({
  selector: 'input-location',
  templateUrl: 'input-location.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted', 'offline', 'mapToken', 'mapLatitude', 'mapLongitude']
})
export class InputLocationComponent {

  PERMISSION_WHEN_IN_USE:string = "when_in_use";
  PERMISSION_GRANTED_ALWAYS:string = "granted_always";
  PERMISSION_GRANTED_WHEN_IN_USE:string = "granted_when_in_use";
  PERMISSION_AUTHORIZED_ALWAYS:string = "authorized_always";
  PERMISSION_AUTHORIZED_WHEN_IN_USE:string = "authorized_when_in_use";

  formGroup:FormGroup;
  attribute:Attribute = null;
  value: Value = null;
  map:string = null;
  mapToken:string;
  mapLatitude:number;
  mapLongitude:number;

  latitude:number = null;
  longitude:number = null;
  street:string = null;
  city:string = null;
  province:string = null;
  country:string = null;

  submitted:boolean = false;
  authorized:boolean = null;
  located:boolean = null;
  geocoded:boolean = null;
  defaulted:boolean = null;
  offline:boolean = false;
  shouldTimeout:boolean = false;

  countries:Country[] = [];
  countriesOptions:{} = {
    title: 'Countries',
    placeholder: 'Country'
  };

  provinces:Province[] = [];
  provincesOptions:{} = {
    title: 'Provinces',
    placeholder: 'Province'
  };

  @Output()
  changeLocation = new EventEmitter();

  constructor(
    private _zone:NgZone,
    private http:Http,
    private device:Device,
    private logger:LoggerService,
    private diagnostic:Diagnostic,
    private geolocation:Geolocation,
    private nativeGeocoder:NativeGeocoder,
    private language:LanguageService) {

  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    if (this.value == null || this.value.value == null || this.value.value.length == 0) {
      this.defaultLocation().then((defaulted:boolean) => {
        this.defaulted = defaulted;
      },
      (error:any) => {
        this.defaulted = false;
      });
      this.authorizeLocation().then((authorized:boolean) => {
        this.authorized = authorized;
        this.detectLocation().then((located:boolean) => {
          this.located = located;
        },
        (error:any) => {
          this.located = false;
        });
      },
      (error:any) => {
        this.authorized = false;
        this.located = false;
      });
    }
    else if (this.value.value.indexOf(", ") > -1) {
      // IGNORE ADDRESS STRING
    }
    else if (this.value.value.indexOf(",") > -1) {
      let coordinate:any = this.value.value.split(",");
      this.latitude = Number(coordinate[0]);
      this.longitude = Number(coordinate[1]);
      this.located = true;
      this.loadStaticMap(this.latitude, this.longitude);
    }
    this.loadCountries().then((countries:Country[]) => {
      this.countries = countries;
    });
  }

  ngAfterContentChecked() {
    try {
      if (this.value == null || this.value.value == null || this.value.value.length == 0) {
        // IGNORE BLANK VALUE
      }
      else if (this.value.value.indexOf(", ") > -1) {
        // IGNORE ADDRESS STRING
      }
      else if (this.value.value.indexOf(",") > -1) {
        let coordinate:any = this.value.value.split(",");
        if (coordinate && coordinate.length > 0) {
          let latitude = Number(coordinate[0]);
          let longitude = Number(coordinate[1]);
          if (this.latitude != latitude || this.longitude != longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.located = true;
            this.loadStaticMap(latitude, longitude);
          }
        }
      }
      if (this.countries == null || this.countries.length == 0) {
        this.loadCountries().then((countries:Country[]) => {
          this.countries = countries;
        });
      }
    }
    catch (error) {
      this.logger.info(this, "ngAfterContentChecked", error);
    }
  }

  authorizeLocation(event:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "authorizeLocation");
      this.diagnostic.isLocationAuthorized().then((authorized:boolean) => {
        this.logger.info(this, "authorizeLocation", "isLocationAuthorized", authorized);
        if (authorized) {
          this.authorized = true;
          resolve(true);
        }
        else {
          this.authorized = false;
          this.requestLocation().then((authorized:boolean) => {
            if (authorized) {
              this.authorized = true;
              resolve(true);
            }
            else {
              this.authorized = false;
              reject('Not Authorized');
            }
          },
          (error:any) => {
            this.authorized = false;
            reject(error);
          });
        }
      },
      (error:any) => {
        this.logger.error(this, "authorizeLocation", "isLocationAuthorized", error);
        this.authorized = false;
        reject(error);
      });
    });
  }

  requestLocation(event:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "requestLocation");
      this.shouldTimeout = true;
      setTimeout(() => {
        if (this.shouldTimeout) {
          this.logger.error(this, "requestLocation", "requestLocationAuthorization", "Timeout");
          reject("Timeout");
        }
      }, 9000);
      this.diagnostic.requestLocationAuthorization(this.PERMISSION_WHEN_IN_USE).then((status:string) => {
        this.logger.info(this, "requestLocation", "requestLocationAuthorization", status);
        this.shouldTimeout = false;
        if (this.isAuthorized(status)) {
          if (this.authorized == false && this.latitude == null && this.longitude == null) {
            this.logger.info(this, "requestLocation", "requestLocationAuthorization", "AUTHORIZATION CHANGED");
            this.detectLocation().then((detected:boolean) => {
              this.logger.info(this, "requestLocation", "detectLocation", detected);
            },
            (error:any) => {
              this.logger.error(this, "requestLocation", "detectLocation", error);
            });
          }
          this.authorized = true;
          resolve(true);
        }
        else {
          this.authorized = false;
          reject("Not Authorized");
        }
      },
      (error:any) => {
        this.logger.error(this, "authorizeLocation", "requestLocationAuthorization", error);
        this.authorized = false;
        this.shouldTimeout = false;
        reject(error);
      });
    });
  }

  detectLocation(event:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "detectLocation");
      let options:GeolocationOptions = {
        timeout: 12000,
        enableHighAccuracy: true };
      this.geolocation.getCurrentPosition(options).then((position:Geoposition) => {
        this.logger.info(this, "detectLocation", "Position", position);
        if (position && position.coords) {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.located = true;
          this.loadStaticMap(this.latitude, this.longitude);
          resolve(true);
        }
        else {
          this.latitude = null;
          this.longitude = null;
          this.located = false;
          reject("No Location Detected");
        }
      },
      (error:any) => {
        this.logger.error(this, "detectLocation", "Error", error.message);
        this.latitude = null;
        this.longitude = null;
        this.located = false;
        reject(error);
      });
    });
  }

  defaultLocation(event:any=null):Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "defaultLocation");
      if (this.mapLatitude && this.mapLongitude) {
        this.latitude = null;
        this.longitude = null;
        this.defaulted = true;
        this.loadBaseMap(this.mapLatitude, this.mapLongitude);
        resolve(true);
      }
      else {
        this.latitude = null;
        this.longitude = null;
        this.defaulted = false;
        reject("No Default Location");
      }
    });
  }

  isAuthorized(status:string):boolean {
    if (status == this.PERMISSION_AUTHORIZED_ALWAYS) {
      return true;
    }
    else if (status == this.PERMISSION_AUTHORIZED_WHEN_IN_USE) {
      return true;
    }
    if (status == this.PERMISSION_GRANTED_ALWAYS) {
      return true;
    }
    else if (status == this.PERMISSION_GRANTED_WHEN_IN_USE) {
      return true;
    }
    return false;
  }

  showSettings(event:any=null) {
    this.logger.info(this, "showSettings");
    this.diagnostic.switchToSettings();
  }

  updateLocation(event:any=null) {
    this.logger.info(this, "updateLocation");
    if (this.latitude && this.longitude) {
      this.changeLocation.emit({
        latitude: this.latitude,
        longitude: this.longitude });
    }
    else if (this.mapLatitude && this.mapLongitude) {
      this.changeLocation.emit({
        latitude: this.mapLatitude,
        longitude: this.mapLongitude });
    }
  }

  loadStaticMap(latitude:number, longitude:number) {
    this.logger.info(this, "loadStaticMap", latitude, longitude);
    if (latitude && longitude) {
      let staticMap = new StaticMap(this.mapToken, latitude, longitude);
      this.map = staticMap.getUrl();
    }
    else {
      this.map = null;
    }
  }

  loadBaseMap(latitude:number, longitude:number) {
    this.logger.info(this, "loadBaseMap", latitude, longitude);
    if (latitude && longitude) {
      this.map = new BaseMap(this.mapToken, latitude, longitude).getUrl();
    }
    else {
      this.map = null;
    }
  }

  loadCountries():Promise<Country[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadCountries");
      this.http.get("assets/data/countries.json")
        .map((res) => res.json())
        .subscribe((json) => {
          this.logger.info(this, "loadCountries", json);
          resolve(<Country[]>json);
        });
    });
  }

  loadProvinces():Promise<Province[]> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "loadProvinces");
      this.http.get("assets/data/provinces.json")
        .map((res) => res.json())
        .subscribe((json) => {
          this.logger.info(this, "loadProvinces", json);
          resolve(<Province[]>json);
        });
    });
  }

  streetChanged(event:any) {
    this.logger.info(this, "streetChanged", this.street);
    this.geocodeAddress().then((geocoded:boolean) => {
      this.geocoded = geocoded;
    },
    (error:any) => {
      this.geocoded = false;
    });
  }

  cityChanged(event:any) {
    this.logger.info(this, "cityChanged", this.city);
    this.geocodeAddress().then((geocoded:boolean) => {
      this.geocoded = geocoded;
    },
    (error:any) => {
      this.geocoded = false;
    });
  }

  provinceChanged(event:any) {
    this.logger.info(this, "provinceChanged", this.province);
    this.geocodeAddress().then((geocoded:boolean) => {
      this.geocoded = geocoded;
    },
    (error:any) => {
      this.geocoded = false;
    });
  }

  countryChanged(event:any) {
    this.logger.info(this, "countryChanged", this.country);
    let filteredProvinces = [];
    this.loadProvinces().then((allProvinces:Province[]) => {
      let country:Country = this.countries.filter(c => c.name == this.country)[0];
      for (let province of allProvinces) {
        if (province.country == country.code) {
          filteredProvinces.push(province);
        }
      }
      this.provinces = filteredProvinces;
    });
  }

  geocodeAddress():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "geocodeAddress");
      let address = [];
      if (this.street && this.street.length > 0) {
        address.push(this.street);
      }
      if (this.city && this.city.length > 0) {
        address.push(this.city);
      }
      if (this.province != null && this.province.length > 0) {
        address.push(this.province);
      }
      if (this.country != null && this.country.length > 0) {
        address.push(this.country);
      }
      this.logger.info(this, "geocodeAddress", address.join(", "));
      this.nativeGeocoder.forwardGeocode(address.join(", "))
        .then((coordinates:NativeGeocoderForwardResult) => {
          this.logger.info(this, "geocodeAddress", address, coordinates);
          this.latitude = Number(coordinates.latitude);
          this.longitude = Number(coordinates.longitude);
          this.loadStaticMap(this.latitude, this.longitude);
          resolve(true);
        })
        .catch((error:any) => {
          this.logger.error(this, "geocodeAddress", address, error);
          reject(error);
        });
    });
  }

}
