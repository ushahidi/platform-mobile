import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';

import { DatabaseService } from './database-service';

@Injectable()
export class ApiService {

  clientId: any = String;
  clientSecret: any = String;

  constructor(
    public platform:Platform,
    public http: Http,
    public database: DatabaseService) {
    this.clientId = "ushahidiui";
    this.clientSecret = "35e7f0bca957836d05ca0492211b0ac707671261";
  }

  getHeaders(accessToken:string=null) {
    let headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    if (accessToken != null) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }
    return headers;
  }

  searchDeployments(search:string) {
    return new Promise((resolve, reject) => {
      let params = new URLSearchParams();
      if (search != null) {
        params.set("q", search);
      }
      let url = "https://api.ushahidi.io/deployments";
      let headers = this.getHeaders();
      let options = new RequestOptions({ headers: headers, search: params });
      console.log(`API GET ${url} ${params.toString()}`);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API GET ${url} ${JSON.stringify(json)}`);
            let deployments = json;
            resolve(deployments);
          },
          (error) => {
            console.error(`API GET ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          });
    });
  }

  authLogin(host:string, username:string, password:string, scope:string="api posts forms tags sets media config") {
    return new Promise((resolve, reject) => {
      let api = "/oauth/token";
      let params = {
        grant_type: "password",
        scope: scope,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: username,
        password: password};
      let url = host + api;
      let body = JSON.stringify(params);
      let headers = this.getHeaders();
      let options = new RequestOptions({ headers: headers });
      console.log(`API POST ${url} ${body}`);
      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API POST ${url} ${JSON.stringify(json)}`);
            let tokens = {
              access_token: json.access_token,
              refresh_token: json.refresh_token }
            console.log(`access_token ${json.access_token} refresh_token ${json.refresh_token}`);
            resolve(tokens);
          },
          (error) => {
            console.error(`API POST ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  authRefresh(host:string, refreshToken:string, scope:string="api posts forms tags sets media config") {
    return new Promise((resolve, reject) => {
      let api = "/oauth/token";
      let params = {
        grant_type: "client_credentials",
        scope: scope,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken};
      let url = host + api;
      let body = JSON.stringify(params);
      let headers = this.getHeaders();
      let options = new RequestOptions({ headers: headers });
      console.log(`API POST ${url} ${body}`);
      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API POST ${url} ${JSON.stringify(json)}`);
            let tokens = {
              access_token: json.access_token,
              refresh_token: refreshToken }
            console.log(`access_token ${json.access_token} refresh_token ${refreshToken}`);
            resolve(tokens);
          },
          (error) => {
            console.error(`API POST ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  getConfigSite(host:string, token:string) {
    return new Promise((resolve, reject) => {
      let api = "/api/v3/config/";
      let params = new URLSearchParams();
      let url = host + api;
      let headers = this.getHeaders(token);
      let options = new RequestOptions({ headers: headers, search: params });
      console.log(`API GET ${url} ${params.toString()}`);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API GET ${url} ${JSON.stringify(json)}`);
            let results = json.results;
            for (let i = 0; i < results.length; i++) {
              let item = results[i];
              if (item.id == 'site') {
                console.log(`API GET Site ${item}`);
                resolve(item);
              }
            }
          },
          (error) => {
            console.error(`API GET ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  getPosts(host:string, token:string, search:string=null, form:string=null, user:string=null, cache:boolean=true) {
    return new Promise((resolve, reject) => {
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
      let url = host + api;
      let headers = this.getHeaders(token);
      let options = new RequestOptions({ headers: headers, search: params });
      console.log(`API GET ${url} ${params.toString()}`);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API GET ${url} ${JSON.stringify(json)}`);
            let posts = json;
            resolve(posts);
          },
          (error) => {
            console.error(`API GET ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  getPost(host:string, token:string, id:number, cache:boolean=true) {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/posts/#{id}`;
      let params = new URLSearchParams();
      let url = host + api;
      let headers = this.getHeaders(token);
      let options = new RequestOptions({ headers: headers, search: params });
      console.log(`API GET ${url}`);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API GET ${url} ${JSON.stringify(json)}`);
            let post = json;
            resolve(post);
          },
          (error) => {
            console.error(`API GET ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  createPost(host:string, token:string, title:string, message:string=null) {
    return new Promise((resolve, reject) => {
      let api = "/api/v3/posts/";
      let params = {};
      if (title != null) {
        params["title"] = title;
      }
      if (message != null) {
        params["message"] = message;
      }
      let url = host + api;
      let body = JSON.stringify(params);
      let headers = this.getHeaders(token);
      let options = new RequestOptions({ headers: headers });
      console.log(`API POST ${url} ${body}`);
      this.http.post(url, body, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API POST ${url} ${JSON.stringify(json)}`);
            let post = json;
            resolve(post);
          },
          (error) => {
            console.error(`API POST ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  updatePost(host:string, token:string, id:string, title:string=null, message:string=null) {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/posts/${id}`;
      let params = {};
      if (title != null) {
        params["title"] = title;
      }
      if (message != null) {
        params["message"] = message;
      }
      let url = host + api;
      let body = JSON.stringify(params);
      let headers = this.getHeaders(token);
      let options = new RequestOptions({ headers: headers });
      console.log(`API PUT ${url} ${body}`);
      this.http.put(url, body, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API PUT ${url} ${JSON.stringify(json)}`);
            let post = json;
            resolve(post);
          },
          (error) => {
            console.error(`API PUT ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  getForms(host:string, token:string, cache:boolean=true) {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/forms`;
      let params = new URLSearchParams();
      let url = host + api;
      let headers = this.getHeaders(token);
      let options = new RequestOptions({ headers: headers, search: params });
      console.log(`API GET ${url}`);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API GET ${url} ${JSON.stringify(json)}`);
            let forms = json.results;
            resolve(forms);
          },
          (error) => {
            console.error(`API GET ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  getAttributes(host:string, token:string, cache:boolean=true) {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/forms/attributes`;
      let params = new URLSearchParams();
      let url = host + api;
      let headers = this.getHeaders(token);
      let options = new RequestOptions({ headers: headers, search: params });
      console.log(`API GET ${url}`);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (json) => {
            console.log(`API GET ${url} ${JSON.stringify(json)}`);
            let attributes = json.results;
            resolve(attributes);
          },
          (error) => {
            console.error(`API Failed ${url} ${JSON.stringify(error)}`);
            reject(JSON.stringify(error));
          }
        );
    });
  }

  getFormsWithAttributes(host:string, token:string, cache:boolean=true) {
    return Promise.all([
      this.getForms(host, token, cache),
      this.getAttributes(host, token, cache)]).
      then(results => {
        console.log(`API Results ${JSON.stringify(results)}`);
        let forms = <any[]>results[0];
        console.log(`API Forms ${JSON.stringify(forms)}`);
        let attributes = <any[]>results[1];
        console.log(`API Attributes ${JSON.stringify(attributes)}`);
        for (var i = 0; i <= forms.length; i++){
          let form = forms[i];
          if (form) {
            form.attributes = [];
            for (var j = 0; j <= attributes.length; j++){
              let attribute = attributes[j];
              if (attribute) {
                console.log(`API Attribute ${JSON.stringify(attribute)}`);
                if (form.id == attribute.form_stage_id) {
                  form.attributes.push(attribute);
                }
              }
            }
            form.attributes = form.attributes.sort(function(a, b){
              return a.cardinality - b.cardinality;
            });
          }
        }
        return forms;
      });
  }

}
