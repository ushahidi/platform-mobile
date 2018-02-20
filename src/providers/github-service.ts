import { Injectable, ErrorHandler } from '@angular/core';
import { IonicErrorHandler } from 'ionic-angular';
import { Http } from '@angular/http';

import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { FileTransfer } from '@ionic-native/file-transfer';

import { HttpService } from '../providers/http-service';
import { LoggerService } from '../providers/logger-service';

declare var cordova: any;

@Injectable()
export class GithubService extends HttpService {

  private username:string = "ushahidi";
  private repo:string = "platform-mobile";
  private token:string = "285d08cf72abe0d69d25db1e3287f5f3622f7ad5";
  private server:string = "https://api.github.com";

  constructor(
    protected http:Http,
    protected file:File,
    protected transfer:FileTransfer,
    protected logger:LoggerService) {
    super(http, file, transfer, logger);
  }

  closeIssues(title:string):Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.info(this, "closeIssues", title);
      this.findIssues(title).then((issues:any[]) => {
        let promises = [];
        for (let issue of issues) {
          promises.push(this.closeIssue(issue.number))
        }
        Promise.all(promises).then(closed => {
          resolve(closed);
        },
        (error:any) => {
          reject(error);
        });
      },
      (error:any) => {

      });
    });
  }

  closeIssue(issue:number):Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.server}/repos/${this.username}/${this.repo}/issues/${issue}`;
      let params = {
        state: 'closed' };
      this.logger.info(this, "closeIssue", url, params);
      this.httpPatch(url, this.token, params).then(
        (issue:any) => {
          this.logger.info(this, "closeIssue", url, params, "Issue", issue.state);
          if (issue && issue.number) {
            resolve(issue.number);
          }
          else {
            reject("Issue Not Closed");
          }
        },
        (error:any) => {
          this.logger.error(this, "closeIssue", url, params, "Error", error);
          reject(error);
        });
    });
  }

  createIssueOrComment(title:string, body:string):Promise<any> {
    return new Promise((resolve, reject) => {
      this.findIssue(title).then((issue:string) => {
        this.createComment(issue, body).then((comment:any) => {
          resolve(comment);
        },
        (error:any) => {
          reject(error);
        });
      },
      (error:any) => {
        this.createIssue(title, body).then((issue:any) => {
          resolve(issue);
        },
        (error:any) => {
          reject(error);
        });
      });
    });
  }

  findIssues(title:string):Promise<any[]> {
    return new Promise((resolve, reject) => {
      let url = `${this.server}/search/issues`;
      let params = {
        q: `${title} is:issue in:title repo:${this.username}/${this.repo}` };
      this.logger.info(this, "findIssues", url, params);
      this.httpGet(url, this.token, params).then(
        (issues:any) => {
          this.logger.error(this, "findIssues", url, params, "Issues", issues.total_count);
          if (issues.total_count > 0) {
            resolve(issues.items);
          }
          else {
            reject("Issue Not Found");
          }
        },
        (error:any) => {
          this.logger.error(this, "findIssues", url, params, "Error", error);
          reject(error);
        });
    });
  }

  findIssue(title:string):Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.server}/search/issues`;
      let params = {
        q: `${title} is:issue in:title repo:${this.username}/${this.repo}` };
      this.logger.info(this, "findIssue", url, params);
      this.httpGet(url, this.token, params).then(
        (issues:any) => {
          if (issues.total_count > 0) {
            let number = null;
            for (let issue of issues.items) {
              if (issue.title == title) {
                number = issue.number;
                this.logger.info(this, "findIssue", url, params, "Issue", issue);
                break;
              }
            }
            if (number) {
              resolve(number);
            }
            else {
              reject("Issue Not Found");
            }
          }
          else {
            reject("Issue Not Found");
          }
        },
        (error:any) => {
          this.logger.error(this, "findIssue", url, params, "Error", error);
          reject(error);
        });
    });
  }

  createIssue(title:string, body:string):Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.server}/repos/${this.username}/${this.repo}/issues`;
      let params = {
        title: title,
        body: body };
      this.logger.info(this, "createIssue", url, params);
      this.httpPost(url, this.token, params).then(
        (issue:any) => {
          this.logger.info(this, "createIssue", url, params, "Issue", issue);
          if (issue && issue.id) {
            resolve(issue.id);
          }
          else {
            reject("Issue Not Created");
          }
        },
        (error:any) => {
          this.logger.error(this, "createIssue", url, params, "Error", error);
          reject(error);
        });
    });
  }

  createComment(issue:string, body:string):Promise<any> {
    return new Promise((resolve, reject) => {
      let url = `${this.server}/repos/${this.username}/${this.repo}/issues/${issue}/comments`;
      let params = {
        body: body };
      this.logger.info(this, "createComment", url, params);
      this.httpPost(url, this.token, params).then(
        (comment:any) => {
          this.logger.info(this, "createComment", url, params, "Comment", comment);
          if (comment && comment.id) {
            resolve(comment.id);
          }
          else {
            reject("Comment Not Created");
          }
        },
        (error:any) => {
          this.logger.error(this, "createComment", url, params, "Error", error);
          reject(error);
        });
    });
  }

}

@Injectable()
export class GithubErrorHandler extends IonicErrorHandler implements ErrorHandler {
  constructor(private device:Device, private logger:LoggerService, private githubService:GithubService) {
    super();
  }

  handleError(error:any): void {
    try {
      let title = [];
      let source = [];
      let body = [];
      if (error.name) {
        title.push(error.name);
      }
      if (error.message) {
        title.push(error.message);
      }
      if (this.device.manufacturer) {
        source.push(this.device.manufacturer);
      }
      if (this.device.platform) {
        source.push(this.device.platform);
      }
      if (this.device.version) {
        source.push(this.device.version);
      }
      if (this.device.model) {
        source.push(this.device.model);
      }
      if (source.length > 0) {
        body.push(source.join(" "));
      }
      if (error.stack) {
        body.push(" ");
        body.push(error.stack);
      }
      this.githubService.createIssueOrComment(title.join(" "), body.join("\n")).then((response:any) => {
        this.logger.info(this, "handleError", "Response", response);
      },
      (error:any) => {
        this.logger.error(this, "handleError", "Error", error);
      });
    }
    catch (err) {
      this.logger.error(this, "handleError", "Error", err);
    }
    super.handleError(error);
  }
}
