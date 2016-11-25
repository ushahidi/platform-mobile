import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NativeStorage, SecureStorage } from 'ionic-native';
import { Http, Headers, URLSearchParams, Request, RequestOptions, RequestMethod } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch';

@Injectable()
export class ApiService {
  secureStorage: SecureStorage;
  domain: any = String;
  clientId: any = String;
  clientSecret: any = String;
  accessToken: any = String;
  refreshToken: any = String;

  constructor(public http: Http, public platform:Platform) {
    console.log('ApiService');
    this.domain = "https://dale.api.ushahidi.io";
    this.clientId = "ushahidiui";
    this.clientSecret = "35e7f0bca957836d05ca0492211b0ac707671261";
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

  getHeaders(accessToken:string=null) {
    let headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    // headers.set('Access-Control-Allow-Origin', '*');
    // headers.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Range, Content-Disposition, Content-Type, Authorization');
    // headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    if (accessToken != null) {
      // headers.set('Access-Control-Allow-Credentials', "true");
      headers.set("Authorization", `Bearer ${accessToken}`)
    }
    return headers;
  }

  postLogin(username:string, password:string, scope:string="api posts forms tags sets media") {
    if (this.accessToken) {
      console.log(`Cached ${this.accessToken}`);
      return Promise.resolve(this.accessToken);
    }
    return new Promise(resolve => {
      let api = "/oauth/token";
      let params = {
        grant_type: "password",
        scope: scope,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: username,
        password: password};
      let url = this.domain + api;
      let body = JSON.stringify(params);
      let headers = this.getHeaders();
      let options = new RequestOptions({ headers: headers });
      console.log(`Posting ${url} ${body}`);
      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`Posted ${url} ${JSON.stringify(json)}`);
            this.accessToken = json.access_token;
            this.refreshToken = json.refresh_token;
            console.log(`access_token ${json.access_token} refresh_token ${json.refresh_token}`);
            resolve(this.accessToken);
          },
          (err) => {
            console.error(`Failed ${url} ${JSON.stringify(err)}`);
            resolve(null);
          }
        );
    });
  };

  searchDeployments(search:string, cache:boolean=true) {
    return new Promise(resolve => {
      let params = new URLSearchParams();
      if (search != null) {
        params.set("q", search);
      }
      let url = "http://api.ushahididev.com/deployments";
      let headers = this.getHeaders();
      //let options = new RequestOptions({ headers: headers, search: params });
      let options = new RequestOptions({
        method: RequestMethod.Get,
        url: url,
        headers: headers,
        search: params
      });
      console.log(`Downloading ${url}`);
      this.http.request(new Request(options))
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`Downloaded ${url}`);
            console.log(`JSON #{json}`);
            // console.log(JSON.stringify(json));
            let deployments = json;
            resolve(deployments);
          },
          (err) => {
            console.error(`Failed ${url} ${JSON.stringify(err)}`);
            resolve(null);
          });
    });
  }

  getPosts(search:string=null, form:string=null, user:string=null, cache:boolean=true) {
    return new Promise(resolve => {
      let api = "/api/v3/posts";
      let params = new URLSearchParams();
      if (search != null) {
        params.set("q", search);
      }
      if (form != null) {
        params.set("form", form);
      }
      if (user != null) {
        params.set("user", user);
      }
      let url = this.domain + api;
      let headers = this.getHeaders(this.accessToken);
      let options = new RequestOptions({ headers: headers, search: params });
      console.log(`Downloading ${url}`);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`Downloaded ${url} ${JSON.stringify(json)}`);
            let posts = json;
            resolve(posts);
          },
          (err) => {
            console.error(`Failed ${url} ${JSON.stringify(err)}`);
            resolve(null);
          }
        );
    });
  }

  getPost(id:number, cache:boolean=true) {
    return new Promise(resolve => {
      let api = `/api/v3/posts/#{id}`;
      let params = new URLSearchParams();
      let url = this.domain + api;
      let headers = this.getHeaders(this.accessToken);
      let options = new RequestOptions({ headers: headers, search: params });
      console.log(`Downloading ${url}`);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`Downloaded ${url} ${JSON.stringify(json)}`);
            let post = json;
            resolve(post);
          },
          (err) => {
            console.error(`Failed ${url} ${JSON.stringify(err)}`);
            resolve(null);
          }
        );
    });
  }

  createPost(title:string, message:string=null) {
    return new Promise(resolve => {
      let api = "/api/v3/posts/";
      let params = {};
      if (title != null) {
        params["title"] = title;
      }
      if (message != null) {
        params["message"] = message;
      }
      let url = this.domain + api;
      let body = JSON.stringify(params);
      let headers = this.getHeaders(this.accessToken);
      let options = new RequestOptions({ headers: headers });
      console.log(`Posting ${url} ${body}`);
      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`Posted ${url} ${JSON.stringify(json)}`);
            let post = json;
            resolve(post);
          },
          (err) => {
            console.error(`Failed ${url} ${JSON.stringify(err)}`);
            resolve(null);
          }
        );
    });
  }

  updatePost(id:number, title:string, message:string=null) {
    return new Promise(resolve => {
      let api = `/api/v3/posts/#{id}`;
      let params = {};
      if (title != null) {
        params["title"] = title;
      }
      if (message != null) {
        params["message"] = message;
      }
      let url = this.domain + api;
      let body = JSON.stringify(params);
      let headers = this.getHeaders(this.accessToken);
      let options = new RequestOptions({ headers: headers });
      console.log(`Updating ${url} ${body}`);
      this.http.put(url, body, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`Updated ${url} ${JSON.stringify(json)}`);
            let post = json;
            resolve(post);
          },
          (err) => {
            console.error(`Failed ${url} ${JSON.stringify(err)}`);
            resolve(null);
          }
        );
    });
  }

}
