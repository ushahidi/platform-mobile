import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';

import { Model } from '../models/model';
import { Deployment } from '../models/deployment';
import { User } from '../models/user';
import { Form } from '../models/form';
import { Attribute } from '../models/attribute';
import { Post } from '../models/post';
import { Value } from '../models/value';
import { Image } from '../models/image';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class ApiService {

  source: string = "mobile";
  clientId: any = "ushahidiui";
  clientSecret: any = "35e7f0bca957836d05ca0492211b0ac707671261";
  scope: string = "api posts forms tags sets users media config";

  constructor(
    public http: Http,
    public logger:LoggerService) {

  }

  authHeaders(accessToken:string=null) {
    let headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    if (accessToken != null) {
      headers.set("Authorization", `Bearer ${accessToken}`)
    }
    return headers;
  }

  httpGet(url:string, token:string=null, params:any=null) {
    return new Promise((resolve, reject) => {
      let search = new URLSearchParams();
      if (params) {
        for (let key in params) {
          search.set(key, params[key])
        }
      }
      let headers = this.authHeaders(token);
      let options = new RequestOptions({ headers: headers, search: search });
      this.logger.info(this, "GET", url, params);
      this.http.get(url, options)
        .map(res => res.json())
        .subscribe(
          (items) => {
            this.logger.info(this, "GET", url, items);
            resolve(items);
          },
          (error) => {
            this.logger.error(this, "GET", url, error);
            reject(this.errorMessage(error));
          });
    });
  }

  httpPost(url:string, token:string=null, params:any=null) {
    return new Promise((resolve, reject) => {
      let body = JSON.stringify(params);
      let headers = this.authHeaders(token);
      let options = new RequestOptions({ headers: headers });
      this.logger.info(this, "POST", url, body);
      this.http.post(url, body, options)
        .map(res => {
          if (res.status == 204) {
            return {}
          }
          else {
            return res.json();
          }
        })
        .subscribe(
          (json) => {
            this.logger.info(this, "POST", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "POST", url, error);
            reject(this.errorMessage(error));
          }
        );
    });
  }

  httpPut(url:string, token:string=null, params:any=null) {
    return new Promise((resolve, reject) => {
      let body = JSON.stringify(params);
      let headers = this.authHeaders(token);
      let options = new RequestOptions({ headers: headers });
      this.logger.info(this, "PUT", url, body);
      this.http.put(url, body, options)
        .map(res => {
          if (res.status == 204) {
            return {}
          }
          else {
            return res.json();
          }
        })
        .subscribe(
          (json) => {
            this.logger.info(this, "PUT", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "PUT", url, error);
            reject(this.errorMessage(error));
          }
        );
    });
  }

  httpDelete(url:string, token:string=null, params:any=null) {
    return new Promise((resolve, reject) => {
      let search = new URLSearchParams();
      if (params) {
        for (let key in params) {
          search.set(key, params[key])
        }
      }
      let headers = this.authHeaders(token);
      let options = new RequestOptions({ headers: headers, search: search });
      this.logger.info(this, "DELETE", url, params);
      this.http.delete(url, options)
        .map(res => res.json())
        .subscribe(
          (items) => {
            this.logger.info(this, "DELETE", url, items);
            resolve(items);
          },
          (error) => {
            this.logger.error(this, "DELETE", url, error);
            reject(this.errorMessage(error));
          });
    });
  }

  searchDeployments(search:string) : Promise<Deployment[]> {
    return new Promise((resolve, reject) => {
      let url = "https://api.ushahidi.io/deployments";
      let params = {
        q: search
      };
      this.httpGet(url, null, params).then(
        (results) => {
          let items = <any[]>results;
          let deployments = [];
          for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let deployment:Deployment = new Deployment();
            deployment.name = item['deployment_name'];
            deployment.domain = item['domain'];
            deployment.subdomain = item['subdomain'];
            deployment.url = `https://${item['subdomain']}.${item['domain']}`;
            deployments.push(deployment);
          }
          resolve(deployments);
        },
        (error) => {
          reject(error);
        });
    });
  }

  authLogin(deployment:Deployment, username:string, password:string) {
    return new Promise((resolve, reject) => {
      let api = "/oauth/token";
      let url = deployment.url + api;
      let params = {
        grant_type: "password",
        scope: this.scope,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: username,
        password: password};
      this.httpPost(url, null, params).then(
        (json) => {
          let tokens = {
            username: username,
            password: password,
            access_token: json['access_token'],
            refresh_token: json['refresh_token'] }
          resolve(tokens);
        },
        (error) => {
          reject(error);
        })
    });
  }

  authRefresh(deployment:Deployment, refreshToken:string) {
    return new Promise((resolve, reject) => {
      let api = "/oauth/token";
      let url = deployment.url + api;
      let params = {
        grant_type: "refresh_token",
        scope: this.scope,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken};
      this.httpPost(url, null, params).then(
        (json) => {
          let tokens = {
            access_token: json['access_token'],
            refresh_token: json['refresh_token'] }
          resolve(tokens);
        },
        (error) => {
          reject(error);
        })
    });
  }

  getUsers(deployment:Deployment) : Promise<User[]> {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/users`;
      let url = deployment.url + api;
      this.httpGet(url, deployment.access_token).then(
        (json) => {
          let items = <any[]>json['results'];
          let users = [];
          for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let user:User = new User();
            user.id = item['id'];
            user.email = item['email'];
            user.name = item['realname'];
            user.gravatar = item['gravatar'];
            user.image = `https://www.gravatar.com/avatar/${item['gravatar']}.jpg?s=32`;
            users.push(user);
          }
          resolve(users);
        },
        (error) => {
          reject(error);
        });
    });
  }

  getUser(deployment:Deployment, user:any="me"): Promise<User>  {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/users/${user}`;
      let url = deployment.url + api;
      this.httpGet(url, deployment.access_token).then(
        (json) => {
          let user:User = new User();
          user.id = json['id'];
          user.email = json['email'];
          user.name = json['realname'];
          user.gravatar = json['gravatar'];
          user.image = `https://www.gravatar.com/avatar/${json['gravatar']}.jpg?s=32`;
          resolve(user);
        },
        (error) => {
          reject(error);
        });
    });
  }

  getDeployment(deployment:Deployment): Promise<Deployment> {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/config`;
      let url = deployment.url + api;
      this.httpGet(url, deployment.access_token).then(
        (json) => {
          let results = json['results'];
          for (let i = 0; i < results.length; i++) {
            let item = results[i];
            if (item.id == 'site') {
              let deployment:Deployment = new Deployment();
              deployment.name = item['name'];
              deployment.email = item['email'];
              deployment.image = item['image_header'];
              deployment.description = item['description'];
              resolve(deployment);
            }
          }
        },
        (error) => {
          reject(error);
        });
    });
  }

  getPosts(deployment:Deployment, search:string=null, form:string=null, user:string=null): Promise<Post[]> {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/posts/`;
      let url = deployment.url + api;
      let params = {};
      if (search != null) {
        params["q"] = search;
      }
      if (form != null) {
        params["form"] = form;
      }
      if (user != null) {
        params["user"] = user;
      }
      this.httpGet(url, deployment.access_token, params).then(
        (json) => {
          let items = <any[]>json['results'];
          let posts = [];
          for (let i = 0; i < items.length; i++) {
            let item:any = items[i];
            let post:Post = new Post();
            post.deployment_id = deployment.id;
            post.id = item.id;
            post.url = `${deployment.url}\posts\${item.id}`;
            post.slug = item.slug;
            post.title = item.title;
            post.color = item.color;
            post.status = item.status;
            post.created = item.created;
            post.updated = item.updated;
            post.posted = item.post_date;
            if (item.user) {
              post.user_id = item.user.id;
            }
            if (item.form) {
              post.form_id = item.form.id;
            }
            if (item.allowed_privileges) {
              post.can_read = item.allowed_privileges.indexOf("read") > -1;
              post.can_create = item.allowed_privileges.indexOf("create") > -1;
              post.can_update = item.allowed_privileges.indexOf("update") > -1;
              post.can_delete = item.allowed_privileges.indexOf("delete") > -1;
            }
            else {
              post.can_read = false;
              post.can_create = false;
              post.can_update = false;
              post.can_delete = false;
            }
            for (let key in item.values) {
              let text = item.values[key][0];
              let value:Value = new Value();
              value.deployment_id = deployment.id;
              value.post_id = post.id;
              value.key = key;
              value.value = text;
              if (key == 'location_default') {
                post.latitude = text['lat'];
                post.longitude = text['lon'];
                value.value = `${text['lat']},${text['lon']}`;
              }
              else {
                value.value = text;
              }
              post.values.push(value);
            }
            posts.push(post);
          }
          resolve(posts);
        },
        (error) => {
          reject(error);
        });
    });
  }

  createPost(deployment:Deployment, form:number, title:string, description:string, values:any) {
    return new Promise((resolve, reject) => {
      let api = "/api/v3/posts/";
      let url = deployment.url + api;
      let params = {
        source: this.source,
        form: { id: form },
        title: title,
        content: description,
        values: values };
      this.httpPost(url, deployment.access_token, params).then(
        (json) => {
          resolve(json);
        },
        (error) => {
          reject(error);
        })
    });
  }

  updatePost(deployment:Deployment, post:Post, changes:any) {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/posts/${post.id}`;
      let url = deployment.url + api;
      this.httpPut(url, deployment.access_token, changes).then(
        (json) => {
          resolve(json);
        },
        (error) => {
          reject(error);
        })
    });
  }

  deletePost(deployment:Deployment, post:Post) {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/posts/${post.id}`;
      let url = deployment.url + api;
      let params = {};
      this.httpDelete(url, deployment.access_token, params).then(
        (json) => {
          resolve(json);
        },
        (error) => {
          reject(error);
        })
    });
  }

  getImages(deployment:Deployment): Promise<Image[]> {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/media`;
      let url = deployment.url + api;
      this.httpGet(url, deployment.access_token).then(
        (json) => {
          let items = <any[]>json['results'];
          let media = [];
          for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let image:Image = new Image();
            image.deployment_id = deployment.id;
            image.id = item['id'];
            image.url = item['original_file_url'];
            image.mime = item['mime'];
            image.caption = item['caption'];
            image.width = item['original_width'];
            image.height = item['original_height'];
            image.filesize = item['original_file_size'];
            image.created = item['created'];
            image.updated = item['updated'];
            media.push(image);
          }
          resolve(media);
        },
        (error) => {
          reject(error);
        });
    });
  }

  getForms(deployment:Deployment): Promise<Form[]> {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/forms`;
      let url = deployment.url + api;
      this.httpGet(url, deployment.access_token).then(
        (json) => {
          let items = <any[]>json['results'];
          let forms = [];
          for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let form:Form = new Form();
            form.deployment_id = deployment.id;
            form.id = item['id'];
            form.type = item['type'];
            form.name = item['name'];
            form.color = item['color'];
            form.created = item['created'];
            form.updated = item['updated'];
            form.description = item['description'];
            forms.push(form);
          }
          resolve(forms);
        },
        (error) => {
          reject(error);
        });
    });
  }

  getAttributes(deployment:Deployment): Promise<Attribute[]> {
    return new Promise((resolve, reject) => {
      let api = `/api/v3/forms/attributes`;
      let url = deployment.url + api;
      this.httpGet(url, deployment.access_token).then(
        (json) => {
          let items = <any[]>json['results'];
          let attributes = [];
          for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let attribute:Attribute = new Attribute();
            attribute.deployment_id = deployment.id;
            attribute.id = item['id'];
            attribute.form_id = item['form_stage_id'];
            attribute.key = item['key'];
            attribute.label = item['label'];
            attribute.instructions = item['instructions'];
            attribute.input = item['input'];
            attribute.type = item['type'];
            attribute.required = item['required'];
            attribute.priority = item['priority'];
            attribute.options = item['options'];
            attribute.cardinality = item['cardinality'];
            attributes.push(attribute);
          }
          resolve(attributes);
        },
        (error) => {
          reject(error);
        });
    });
  }

  getFormsWithAttributes(deployment:Deployment): Promise<Form[]> {
    this.logger.info(this, "getFormsWithAttributes");
    return Promise.all([
      this.getForms(deployment),
      this.getAttributes(deployment)]).then(
        (results) => {
          let forms = <any[]>results[0];
          this.logger.info(this, "getFormsWithAttributes", "Forms", forms);
          let attributes = <any[]>results[1];
          this.logger.info(this, "getFormsWithAttributes", "Attributes", attributes);
          for (let i = 0; i < forms.length; i++){
            let form:Form = forms[i];
            form.loadAttributes(attributes);
          }
          return forms;
        },
        (error) => {
          this.logger.error(this, "getFormsWithAttributes", error);
        });
  }

  getPostsWithValues(deployment:Deployment): Promise<Post[]> {
    this.logger.info(this, "getPostsWithValues");
    return Promise.all([
      this.getPosts(deployment),
      this.getForms(deployment),
      this.getImages(deployment),
      this.getUsers(deployment),
      this.getAttributes(deployment)]).
      then(
        (results) => {
          let posts = <Post[]>results[0];
          let forms = <Form[]>results[1];
          let images = <Image[]>results[2];
          let users = <User[]>results[3];
          let attributes = <Attribute[]>results[4];
          for (let i = 0; i < posts.length; i++) {
            let post:Post = posts[i];
            post.loadUser(users);
            post.loadForm(forms);
            for (let j = 0; j < post.values.length; j++) {
              let value:Value = post.values[j];
              value.loadAttribute(attributes);
              if (value.input == 'upload') {
                value.loadImage(images);
                post.loadImage(images, value.value);
              }
              else if (value.input == 'location') {

              }
            }
          }
          return posts;
        },
        (error) => {
          this.logger.error(this, "getPostsWithValues", error);
        });
  }

  errorMessage(err) {
    try {
      let json = err.json();
      if (json['errors']) {
        let errors = json['errors'];
        let message = [];
        for (let i = 0; i < errors.length; i++) {
          let error = errors[i];
          message.push(error['message']);
        }
        return message.join(", ");
      }
    }
    catch (error) {
      this.logger.error(this, "errorMessage", error);
    }
    return JSON.stringify(err);
  }

}
