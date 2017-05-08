import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Http } from '@angular/http';
import { AlertController } from 'ionic-angular';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';

import { StaticMap } from '../../maps/static-map';

import { Value } from '../../models/value';
import { Attribute } from '../../models/attribute';
import { Country } from '../../models/country';
import { Province } from '../../models/province';

import { LoggerService } from '../../providers/logger-service';

@Component({
  selector: 'input-location',
  templateUrl: 'input-location.html',
  inputs: ['value', 'attribute', 'formGroup', 'submitted', 'offline', 'mapToken']
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

  latitude:number = null;
  longitude:number = null;
  street:string = null;
  city:string = null;
  province:string = null;
  country:string = null;

  submitted:boolean = false;
  error:boolean = false;
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
    private http:Http,
    private logger:LoggerService,
    private diagnostic:Diagnostic,
    private geolocation:Geolocation,
    private alertController:AlertController) {

  }

  ngOnInit() {
    this.logger.info(this, "Attribute", this.attribute, "Value", this.value);
    if (this.value && this.value.value) {
      if (this.value.value.indexOf(", ") > -1) {
        // IGNORE ADDRESS STRING
      }
      else if (this.value.value.indexOf(",") > -1) {
        let location:any = this.value.value.split(",");
        this.latitude = Number(location[0]);
        this.longitude = Number(location[1]);
      }
      else {
        this.authorizeLocation().then(
          (authorized:boolean) => {
            this.detectLocation();
          },
          (error:any) => {
            this.showLocationError();
          });
      }
    }
    else {
      this.authorizeLocation().then(
        (authorized:boolean) => {
          this.detectLocation();
        },
        (error:any) => {
          this.showLocationError();
        });
    }
    if (this.offline) {
      this.loadCountries().then((countries:Country[]) => {
        this.countries = countries;
      });
    }
  }

  ngAfterContentChecked() {
    if (this.value && this.value.value) {
      if (this.value.value.indexOf(", ") > -1) {
        // IGNORE ADDRESS STRING
      }
      else if (this.value.value.indexOf(",") > -1) {
        let location:any = this.value.value.split(",");
        if (location && location.length > 0) {
          let latitude = Number(location[0]);
          let longitude = Number(location[1]);
          if (this.latitude != latitude || this.longitude != longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.loadMapSrc(latitude, longitude);
          }
        }
      }
    }
    if (this.offline && this.countries.length == 0) {
      this.loadCountries().then((countries:Country[]) => {
        this.countries = countries;
      });
    }
  }

  authorizeLocation():Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "authorizeLocation");
      this.diagnostic.isLocationAuthorized().then(
        (authorized:boolean) => {
          this.logger.info(this, "authorizeLocation", "isLocationAuthorized", authorized);
          if (authorized) {
            this.error = false;
            resolve(true);
          }
          else {
            this.shouldTimeout = true;
            setTimeout(() => {
              if (this.shouldTimeout) {
                this.logger.error(this, "authorizeLocation", "requestLocationAuthorization", "Timeout");
                this.error = true;
                reject();
              }
            }, 9000);
            this.diagnostic.requestLocationAuthorization(this.PERMISSION_WHEN_IN_USE).then(
              (status:string) => {
                this.logger.info(this, "authorizeLocation", "requestLocationAuthorization", status);
                this.shouldTimeout = false;
                if (status == this.PERMISSION_AUTHORIZED_ALWAYS) {
                  this.error = false;
                  resolve(true);
                }
                else if (status == this.PERMISSION_AUTHORIZED_WHEN_IN_USE) {
                  this.error = false;
                  resolve(true);
                }
                if (status == this.PERMISSION_GRANTED_ALWAYS) {
                  this.error = false;
                  resolve(true);
                }
                else if (status == this.PERMISSION_GRANTED_WHEN_IN_USE) {
                  this.error = false;
                  resolve(true);
                }
                else {
                  this.error = true;
                  reject();
                }
              },
              (error) => {
                this.logger.error(this, "authorizeLocation", "requestLocationAuthorization", error);
                this.shouldTimeout = false;
                this.error = true;
                reject(error);
              });
          }
        },
        (error:any) => {
          this.logger.error(this, "authorizeLocation", "isLocationAuthorized", error);
          this.error = true;
          reject(error);
        });
    });
  }

  detectLocation() {
    this.logger.info(this, "detectLocation");
    let options:GeolocationOptions = {
      timeout: 12000,
      enableHighAccuracy: true };
    this.geolocation.getCurrentPosition(options).then(
      (position:Geoposition) => {
        this.logger.info(this, "detectLocation", "Position", position);
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.error = false;
        this.loadMapSrc(this.latitude, this.longitude);
      },
      (error:any) => {
        this.logger.error(this, "detectLocation", "Error", error);
        this.latitude = null;
        this.longitude = null;
        this.error = true;
        this.loadMapSrc(null, null);
      });
  }

  showLocationError() {
    let alert = this.alertController.create({
      title: 'Location Not Authorized',
      subTitle: "Please check your Settings to ensure Location is authorized.",
      buttons: [
        {
          text: 'Settings',
          handler: () => {
            this.diagnostic.switchToSettings();
          }
        },
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }

  updateLocation(event) {
    this.logger.info(this, "updateLocation");
    this.changeLocation.emit({
      latitude: this.latitude,
      longitude: this.longitude});
  }

  loadMapSrc(latitude, longitude) {
    if (latitude && longitude) {
      this.map = new StaticMap(this.mapToken, latitude, longitude).getUrl();
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

}
