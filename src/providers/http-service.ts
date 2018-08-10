import { Injectable } from '@angular/core';

import { HTTP, HTTPResponse } from '@ionic-native/http';
import { File, Entry, Metadata } from '@ionic-native/file';
import { FileTransfer, FileTransferObject, FileUploadOptions, FileUploadResult, FileTransferError } from '@ionic-native/file-transfer';

import { LoggerService } from '../providers/logger-service';

@Injectable()
export class HttpService {

  constructor(
    protected http:HTTP,
    protected file:File,
    protected transfer:FileTransfer,
    protected logger:LoggerService) {
  }

  private httpHeaders(accessToken:string=null, contentType:string=null):{} {
    let headers = {
      Accept: "application/json",
    };
    if (accessToken && accessToken.length > 0) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (contentType && contentType.length > 0) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  }

  protected httpGet(url:string, token:string=null, params:any={}) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token);
      let parameters = this.httpParameters(params);
      this.logger.info(this, "GET", url, parameters, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.get(url, parameters, headers).then((response:any) => {
        if (response.data) {
          if (response.headers['content-type'].indexOf("application/json") != -1) {
            let data = JSON.parse(response.data);
            this.logger.info(this, "GET", url, response.status, data);
            resolve(data);
          }
          else {
            this.logger.info(this, "GET", url, response.status, response.data);
            resolve(response.data);
          }
        }
        else {
          this.logger.error(this, "GET", url, response.status, "No Data");
          reject("No Response Data");
        }
      },
      (error:any) => {
        this.logger.error(this, "GET", url, error.status, error.error);
        reject(this.httpError(error));
      });
    });
  }

  protected httpPost(url:string, token:string=null, params:any=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token, "application/json");
      let parameters = this.httpParameters(params);
      this.logger.info(this, "POST", url, parameters, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.post(url, parameters, headers).then((response:any) => {
        if (response.data) {
          this.logger.info(this, "POST", url, response.status, response.headers, response.data);
          if (response.headers['content-type'].indexOf("application/json") != -1) {
            let data = JSON.parse(response.data);
            this.logger.info(this, "POST", url, response.status, data);
            resolve(data);
          }
          else {
            this.logger.info(this, "POST", url, response.status, response.data);
            resolve(response.data);
          }
        }
        else {
          this.logger.error(this, "POST", url, response.status, "No Data");
          reject("No Response Data");
        }
      },
      (error:any) => {
        this.logger.error(this, "POST", url, error.status, error.error);
        reject(this.httpError(error));
      });
    });
  }

  protected httpPut(url:string, token:string=null, params:any=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token, "application/json");
      let parameters = this.httpParameters(params);
      this.logger.info(this, "PUT", url, parameters, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.put(url, parameters, headers).then((response:any) => {
        if (response.data) {
          if (response.headers['content-type'].indexOf("application/json") != -1) {
            let data = JSON.parse(response.data);
            this.logger.info(this, "PUT", url, response.status, data);
            resolve(data);
          }
          else {
            this.logger.info(this, "PUT", url, response.status, response.data);
            resolve(response.data);
          }
        }
        else {
          this.logger.error(this, "PUT", url, response.status, "No Data");
          reject("No Response Data");
        }
      },
      (error:any) => {
        this.logger.error(this, "PUT", url, error.status, error.error);
        reject(this.httpError(error));
      });
    });
  }

  protected httpPatch(url:string, token:string=null, params:any=null) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token, "application/json");
      let parameters = this.httpParameters(params);
      this.logger.info(this, "PATCH", url, parameters, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.patch(url, parameters, headers).then((response:any) => {
        if (response.data) {
          if (response.headers['content-type'].indexOf("application/json") != -1) {
            let data = JSON.parse(response.data);
            this.logger.info(this, "PATCH", url, response.status, data);
            resolve(data);
          }
          else {
            this.logger.info(this, "PATCH", url, response.status, response.data);
            resolve(response.data);
          }
        }
        else {
          this.logger.error(this, "PATCH", url, response.status, "No Data");
          reject("No Response Data");
        }
      },
      (error:any) => {
        this.logger.error(this, "PATCH", url, error.status, error.error);
        reject(this.httpError(error));
      });
    });
  }

  protected httpDelete(url:string, token:string=null, params:any={}) {
    return new Promise((resolve, reject) => {
      let headers = this.httpHeaders(token);
      let parameters = this.httpParameters(params);
      this.logger.info(this, "DELETE", url, parameters, headers);
      this.http.setRequestTimeout(30);
      this.http.setDataSerializer("json");
      this.http.delete(url, parameters, headers).then((response:any) => {
        if (response.data) {
          if (response.headers['content-type'].indexOf("application/json") != -1) {
            let data = JSON.parse(response.data);
            this.logger.info(this, "DELETE", url, response.status, data);
            resolve(data);
          }
          else {
            this.logger.info(this, "DELETE", url, response.status, response.data);
            resolve(response.data);
          }
        }
        else {
          this.logger.error(this, "DELETE", url, response.status, "No Data");
          reject("No Response Data");
        }
      },
      (error:any) => {
        this.logger.error(this, "DELETE", url, error.status, error.error);
        reject(this.httpError(error));
      });
    });
  }

  protected fileUpload(url:string, token:string, file:string, caption:string,
             httpMethod:string="POST",
             mimeType:string='application/binary',
             acceptType:string="application/json",
             contentType:string=undefined,
             contentLength:number=null) {
    return new Promise((resolve, reject) => {
      let fileName = file.substr(file.lastIndexOf('/') + 1).split('?').shift();
      let headers = {};
      if (acceptType) {
        headers['Accept'] = acceptType;
      }
      if (contentType) {
        headers['Content-Type'] = contentType;
      }
      if (contentLength) {
        headers['Content-Length'] = contentLength;
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      var params = {};
      if (caption && caption.length > 0) {
        params['caption'] = caption;
      }
      var options:FileUploadOptions = {
        httpMethod: httpMethod,
        mimeType: mimeType,
        fileName: fileName,
        headers: headers,
        params: params
      };
      this.logger.info(this, "UPLOAD", url, file, options);
      let fileTransfer:FileTransferObject = this.transfer.create();
      fileTransfer.upload(file, url, options, true).then((data:FileUploadResult) => {
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

  protected mimeType(file:string):string {
    let extension = file.toLowerCase().substr(file.lastIndexOf('.')+1);
    if (extension == "mov") {
      return "video/quicktime";
    }
    else if (extension == "avi") {
      return "video/avi";
    }
    else if (extension == "mp4") {
      return "video/mp4";
    }
    else if (extension == "jpg") {
      return "image/jpeg";
    }
    else if (extension == "jpeg") {
      return "image/jpeg";
    }
    else if (extension == "png") {
      return "image/png";
    }
    return "application/binary"
  }

  protected fileSize(filePath:any):Promise<number> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "fileSize", filePath);
      this.file.resolveLocalFilesystemUrl(filePath).then((entry:Entry) => {
        this.logger.info(this, "fileSize", filePath, "Entry", entry.fullPath);
        entry.getMetadata((metadata:Metadata) => {
          this.logger.info(this, "fileSize", filePath, "Metadata", metadata);
          resolve(metadata.size);
        },
        (error:any) => {
          this.logger.error(this, "fileSize", filePath, "Metadata", error);
          reject(error);
        });
      },
      (error) => {
        this.logger.error(this, "fileSize", filePath, "Error", error);
        reject(error);
      });
    });
  }

  private httpError(error:any):string {
    try {
      if (error == null) {
        return "An unknown error has occurred";
      }
      if (typeof error === 'string') {
        return error;
      }
      if (typeof error === 'object') {
        if (error['_body'] || error['message'] || error['error']) {
          let message = error['_body'] || error['message'] || error['error'];
          if (message.toString().indexOf("The host could not be resolved") != -1) {
            return "The internet connection appears to be offline";
          }
          else if (message.toString().indexOf("The Internet connection appears to be offline") != -1) {
            return "The internet connection appears to be offline";
          }
          else if (message.toString().indexOf("Timeout") != -1) {
            return "The request has timed out";
          }
          let json = JSON.parse(message);
          if (json['error_description']) {
            return json['error_description'];
          }
          if (json['error']) {
            return json['error'];
          }
          if (json['message']) {
            return json['message'];
          }
          if (json['errors']) {
            let messages = [];
            for (let _error of json['errors']) {
              if (_error['message']) {
                messages.push(_error['message']);
              }
              else if (_error['error']) {
                messages.push(_error['error']);
              }
              else if (_error['title']) {
                messages.push(_error['title']);
              }
            }
            return messages.join(", ");
          }
        }
        if (error['status'] == 400) {
          return "The request was invalid";
        }
        if (error['status'] == 401) {
          return "You are not authorized to access";
        }
        else if (error['status'] == 402) {
          return "Payment is required";
        }
        else if (error['status'] == 403) {
          return "You are forbidden to access";
        }
        else if (error['status'] == 404) {
          return "The resource was not found";
        }
        else if (error['status'] == 405) {
          return "The method is not allowed";
        }
        else if (error['status'] == 406) {
          return "Information not acceptable";
        }
        else if (error['status'] == 408) {
          return "The request has timed out";
        }
        else if (error['status'] == 409) {
          return "Unable to process due to conflict";
        }
        else if (error['status'] == 422) {
          return "Unable to process entities";
        }
        else if (error['status'] == 500) {
          return "Internal server error has occurred";
        }
        else if (error['status'] == 501) {
          return "The method is not implemented";
        }
        else if (error['status'] == 502) {
          return "There was a bad gateway";
        }
        else if (error['status'] == 503) {
          return "The service is unavailable";
        }
      }
    }
    catch(err) {
      this.logger.warn(this, "httpError", error);
    }
    return "An unknown error has occurred";
  }

  private httpParameters(params:any=null):any {
    let parameters = {};
    if (params) {
      for (let key of Object.keys(params)) {
        let value = params[key];
        if (typeof value == 'number') {
          parameters[key] = "" + value;
        }
        else {
          parameters[key] = value;
        }
      }
    }
    return parameters;
  }

}
