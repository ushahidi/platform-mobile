import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';

import { VIMEO_ACCESS_TOKEN } from '../helpers/constants';

declare var cordova: any;

@Injectable()
export class VimeoService extends HttpService {

  private accessToken: string = VIMEO_ACCESS_TOKEN;
  private acceptType: string = "application/vnd.vimeo.*+json;version=3.2";

  constructor(
    public http: Http,
    public logger:LoggerService) {
    super(http, logger);
  }

  uploadVideo(file:string, title, description) {
    this.logger.info(this, "uploadVideo", file);
    return new Promise((resolve, reject) => {
      this.createTicket().then(
        (ticket:any) => {
          this.logger.info(this, "uploadVideo", "createTicket", ticket);
          let uploadUrl = ticket['upload_link_secure'];
          let completeUrl = `https://api.vimeo.com${ticket['complete_uri']}`;
          this.uploadFile(uploadUrl, file).then(
            (uploaded:any) => {
              this.logger.info(this, "uploadVideo", "uploadFile", uploaded);
              this.completeVideo(completeUrl).then(
                (completed:any) => {
                  this.logger.info(this, "uploadVideo", "completeVideo", completed);
                  let location = completed['Location'][0];
                  let videoUrl = `https://vimeo.com${location}`;
                  let videoId = location.substr(location.lastIndexOf('/') + 1);
                  this.logger.info(this, "uploadVideo", "completeVideo", videoId, videoUrl);
                  this.updateVideo(videoId, title, description).then(
                    (updated:any) => {
                      this.logger.info(this, "uploadVideo", "updateVideo", updated);
                      resolve(videoUrl);
                    },
                    (error) => {
                      this.logger.error(this, "uploadVideo", "updateVideo", error);
                      reject(error);
                    });
                },
                (error) => {
                  this.logger.error(this, "uploadVideo", "completeVideo", error);
                  reject(error);
                });
            },
            (error) => {
              this.logger.error(this, "uploadVideo", "uploadFile", error);
              reject(error);
            });
        },
        (error) => {
          this.logger.error(this, "uploadVideo", "createTicket", error);
          reject(error);
      });
    });
  }

  createTicket(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = "https://api.vimeo.com/me/videos";
      let params = { type: "streaming" };
      this.httpPost(url, this.accessToken, params).then(
        (data:any) => {
          this.logger.info(this, "createTicket", data);
          resolve(data);
        },
        (error:any) => {
          reject(error);
        })
    });
  }

  uploadFile(url:string, file:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "uploadFile", url, file);
      this.fileSize(file).then(
        (fileSize) => {
          this.logger.info(this, "uploadFile", "fileSize", fileSize);
          let mimeType = this.mimeType(file);
          this.fileUpload(url, this.accessToken, file, "PUT", mimeType, this.acceptType, mimeType, fileSize).then(
            (data:any) => {
              this.logger.info(this, "uploadFile", url, file, data);
              resolve(data);
            },
            (error:any) => {
              this.logger.error(this, "uploadFile", url, file, error);
              reject(error);
            })
        },
        (error:any) => {
          this.logger.error(this, "uploadFile", "fileSize", error);
          reject(error);
        });
      });
  }

  updateVideo(id:string, name:string=null, description:string=null): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "updateVideo", id);
      let url = `https://api.vimeo.com/videos/${id}`;
      let params = {
        'name': name,
        'description': description,
        'privacy': {
          'download': false,
          'view': 'unlisted',
          'comments': 'nobody'
        }
      };
      this.httpPatch(url, this.accessToken, params).then(
        (data:any) => {
          this.logger.info(this, "updateVideo", id, data);
          resolve(data);
        },
        (error:any) => {
          this.logger.error(this, "updateVideo", id, error);
          reject(error);
        })
    });
  }

  completeVideo(url:string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "completeVideo", url);
      this.httpDelete(url, this.accessToken).then(
        (data:any) => {
          this.logger.info(this, "completeVideo", url, data);
          resolve(data);
        },
        (error:any) => {
          this.logger.error(this, "completeVideo", url, error);
          reject(error);
        })
    });
  }

}
