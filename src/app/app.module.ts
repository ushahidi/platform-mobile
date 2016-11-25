import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';

import { DeploymentListPage } from '../pages/deployment-list/deployment-list';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

import { ResponseMapPage } from '../pages/response-map/response-map';
import { ResponseListPage } from '../pages/response-list/response-list';
import { ResponseDetailsPage } from '../pages/response-details/response-details';

import { ApiService } from '../providers/api-service/api-service';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    DeploymentListPage,
    DeploymentDetailsPage,
    ResponseMapPage,
    ResponseListPage,
    ResponseDetailsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    DeploymentListPage,
    DeploymentDetailsPage,
    ResponseMapPage,
    ResponseListPage,
    ResponseDetailsPage
  ],
  providers: [ApiService]
})
export class AppModule {}
