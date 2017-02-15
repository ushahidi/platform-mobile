import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Transfer, FileUploadOptions, FileUploadResult, FileTransferError } from 'ionic-native';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class HttpService {

  constructor(
    public http: Http,
    public logger:LoggerService) {

  }

  httpHeaders(accessToken:string=null, contentType:string='application/json'): Headers {
    let headers = new Headers();
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', contentType);
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
      let headers = this.httpHeaders(token);
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
      let body = (params != null) ? JSON.stringify(params) : "";
      let headers = this.httpHeaders(token);
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
      let headers = this.httpHeaders(token);
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

  httpPatch(url:string, token:string=null, params:any=null) {
    return new Promise((resolve, reject) => {
      let body = JSON.stringify(params);
      let headers = this.httpHeaders(token);
      let options = new RequestOptions({ headers: headers });
      this.logger.info(this, "PATCH", url, body);
      this.http.patch(url, body, options)
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
            this.logger.info(this, "PATCH", url, json);
            resolve(json);
          },
          (error) => {
            this.logger.error(this, "PATCH", url, error);
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
      let headers = this.httpHeaders(token);
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

  fileUpload(url:string, token:string, file:string, httpMethod:string="POST", mimeType:string='application/binary', accept:string="application/json", contentType:string="multipart/form-data", fileKey:string='file', chunkedMode:boolean=false) {
    return new Promise((resolve, reject) => {
      let transfer = new Transfer();
      var options:FileUploadOptions = {
        fileKey: fileKey,
        httpMethod: httpMethod,
        mimeType: mimeType,
        chunkedMode: chunkedMode,
        fileName: file.substr(file.lastIndexOf('/') + 1).split('?').shift(),
        headers: {
          'Accept' : accept,
          'Content-Type' : undefined,
          'Authorization' : `Bearer ${token}`
        }
      };
      this.logger.info(this, "UPLOAD", url, file, options);
      transfer.upload(file, url, options, true).then(
        (data:FileUploadResult) => {
          this.logger.info(this, "UPLOAD", url, file, data);
          resolve(data);
        },
        (error:FileTransferError) => {
          this.logger.error(this, "UPLOAD", url, file,
            "Code", error.code,
            "Source", error.source,
            "Target", error.target,
            "Body", error.body,
            "Exception", error.exception);
          reject(error.body || error.exception);
       });
    });
  }

  getMimeType(file:string):string {
    let extension = file.toLowerCase().substr(file.lastIndexOf('.')+1)
    if (extension == "mov") {
      return "video/quicktime";
    }
    else if (extension == "avi") {
      return "video/avi";
    }
    else if (extension == "jpg") {
      return "image/jpeg";
    }
    else if (extension == "png") {
      return "image/png";
    }
    return "application/binary"
  }

  errorMessage(err): string {
    try {
      let json = err.json();
      if (json['errors']) {
        let errors = json['errors'];
        let message = [];
        for (let error of errors) {
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
