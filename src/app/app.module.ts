import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { Gravatar } from 'ng2-gravatar-directive';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { DeploymentAddPage } from '../pages/deployment-add/deployment-add';
import { DeploymentLoginPage } from '../pages/deployment-login/deployment-login';
import { DeploymentDetailsPage } from '../pages/deployment-details/deployment-details';

import { ResponseMapPage } from '../pages/response-map/response-map';
import { ResponseListPage } from '../pages/response-list/response-list';
import { ResponseDetailsPage } from '../pages/response-details/response-details';
import { ResponseAddPage } from '../pages/response-add/response-add';
import { ResponseEditPage } from '../pages/response-edit/response-edit';

import { CheckboxComponent } from '../components/checkbox/checkbox';
import { CheckboxesComponent } from '../components/checkboxes/checkboxes';
import { DateComponent } from '../components/date/date';
import { DateTimeComponent } from '../components/datetime/datetime';
import { ImageComponent } from '../components/image/image';
import { LocationComponent } from '../components/location/location';
import { NumberComponent } from '../components/number/number';
import { RadioComponent } from '../components/radio/radio';
import { SelectComponent } from '../components/select/select';
import { TextComponent } from '../components/text/text';
import { TextAreaComponent } from '../components/textarea/textarea';
import { VideoComponent } from '../components/video/video';
import { CardComponent } from '../components/card/card';

import { NiceDate } from '../pipes/nice-date';
import { NiceDecimal } from '../pipes/nice-decimal';
import { NiceHtml } from '../pipes/nice-html';
import { NiceNumber } from '../pipes/nice-number';
import { NiceTime } from '../pipes/nice-time';
import { NiceTitle } from '../pipes/nice-title';

import { ApiService } from '../providers/api-service/api-service';

@NgModule({
  declarations: [
    Gravatar,
    MyApp,
    HomePage,
    DeploymentAddPage,
    DeploymentLoginPage,
    DeploymentDetailsPage,
    ResponseMapPage,
    ResponseListPage,
    ResponseDetailsPage,
    ResponseAddPage,
    ResponseEditPage,
    CheckboxComponent,
    CheckboxesComponent,
    DateComponent,
    DateTimeComponent,
    ImageComponent,
    LocationComponent,
    NumberComponent,
    RadioComponent,
    SelectComponent,
    TextComponent,
    TextAreaComponent,
    VideoComponent,
    CardComponent,
    NiceDate,
    NiceDecimal,
    NiceHtml,
    NiceNumber,
    NiceTime,
    NiceTitle
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [ IonicApp ],
  entryComponents: [
    MyApp,
    HomePage,
    DeploymentAddPage,
    DeploymentLoginPage,
    DeploymentDetailsPage,
    ResponseMapPage,
    ResponseListPage,
    ResponseDetailsPage,
    ResponseAddPage,
    ResponseEditPage
  ],
  providers: [ ApiService, {provide: ErrorHandler, useClass: IonicErrorHandler} ]
})
export class AppModule {}
