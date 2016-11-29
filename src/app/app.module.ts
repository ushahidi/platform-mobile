import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { DeploymentLoginPage } from '../pages/deployment-login/deployment-login';
import { DeploymentListPage } from '../pages/deployment-list/deployment-list';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

import { ResponseMapPage } from '../pages/response-map/response-map';
import { ResponseListPage } from '../pages/response-list/response-list';
import { ResponseDetailsPage } from '../pages/response-details/response-details';
import { ResponseAddPage } from '../pages/response-add/response-add';
import { ResponseEditPage } from '../pages/response-edit/response-edit';

import { ApiService } from '../providers/api-service/api-service';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DeploymentLoginPage,
    DeploymentListPage,
    DeploymentDetailsPage,
    ResponseMapPage,
    ResponseListPage,
    ResponseDetailsPage,
    ResponseAddPage,
    ResponseEditPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    MyApp,
    HomePage,
    DeploymentLoginPage,
    DeploymentListPage,
    DeploymentDetailsPage,
    ResponseMapPage,
    ResponseListPage,
    ResponseDetailsPage,
    ResponseAddPage,
    ResponseEditPage
  ],
  providers: [ ApiService ]
})
export class AppModule {}
