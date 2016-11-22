import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NativeStorage, SecureStorage } from 'ionic-native';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/timeout';

@Injectable()
export class ApiService {
  secureStorage: SecureStorage;
  domain: any = String;
  timeout: any = Number;
  posts: any = [];
  clientId: any = String;
  clientSecret: any = String;
  headers: any = Headers;
  accessToken: any = String;
  refreshToken: any = String;

  constructor(public http: Http, public platform:Platform) {
    console.log('ApiService');
    this.domain = "https://dale.api.ushahidi.io";
    this.clientId = "ushahidiui";
    this.clientSecret = "35e7f0bca957836d05ca0492211b0ac707671261";
    this.headers = new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json'});
    this.platform.ready().then(() => {
      console.log('ApiService Platform Ready');
      // NativeStorage.setItem("test", "test").then(
      //   () => console.log('NativeStorage Stored!'),
      //   error => console.error('NativeStorage Error', error)
      // );
      // this.secureStorage = new SecureStorage();
      // this.secureStorage.create('ushahidi').then(
      //    () => console.log('SecureStorage Ready'),
      //    err => console.error(`SecureStorage ${err}`)
      // );
    });
    this.accessToken = null;
    this.refreshToken = null;
  }

  postLogin(username:string, password:string) {
    if (this.accessToken) {
      console.log(`Cached ${this.accessToken}`);
      return Promise.resolve(this.accessToken);
    }
    return new Promise(resolve => {
      let api = "/oauth/token";
      let params = {
        grant_type: "password",
        scope: "posts",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: username,
        password: password};
      var url = this.domain + api;
      var body = JSON.stringify(params);
      let options = new RequestOptions({ headers: this.headers });
      console.log(`Posting ${url} ${body}`);
      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`Downloaded ${url} ${JSON.stringify(json)}`);
            this.accessToken = json.access_token;
            this.refreshToken = json.refresh_token;
            console.log(`access_token ${json.access_token} refresh_token ${json.refresh_token}`);
            // NativeStorage.setItem(url, this.accessToken).then(
            //   () => console.log('NativeStorage Stored!'),
            //   error => console.error('NativeStorage Error', error)
            // );
            // this.secureStorage.set(url, this.accessToken.toString()).then(
            //   data => {
            //     console.log(`SecureStorage ${url}`);
            //     resolve(this.accessToken);
            //   },
            //   err => {
            //     console.error(`SecureStorage ${err}`);
            //     resolve(null);
            //   });
          },
          (err) => {
            this.logError(url, err);
            resolve(null);
          }
        );
    });
  };

  getPosts(cache:boolean=true, all:boolean=true) {
    return new Promise(resolve => {
      let api = "/api/v3/posts";
      let params = new URLSearchParams();
      var url = this.domain + api + '?' + params.toString();
      this.http.get(url)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log("Downloaded", url);
            console.log(JSON.stringify(json));
            this.posts = json;
            resolve(this.posts);
          },
          (err) => {
            this.logError(url, err);
            resolve(null);
          }
        );
    });
  }

  logError(url: string, err:any) {
    if (err) {
      let keys = Object.keys(err);
      let message = [];
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let value = err[key]
        message.push(`${key}: ${value}`);
      }
      console.error(`Failed ${url} ${message.join(" ")}`);
    }
    else {
      console.error(`Failed ${url} Exception`);
    }
  }


}

// 'posts',
// 'media',
// 'forms',
// 'api',
// 'tags',
// 'savedsearches',
// 'sets',
// 'users',
// 'stats',
// 'layers',
// 'config',
// 'messages',
// 'notifications',
// 'contacts',
// 'roles',
// 'permissions',
// 'csv'
