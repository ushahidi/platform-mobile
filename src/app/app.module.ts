import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { DeploymentsPage } from '../pages/deployments/deployments';

import { ApiService } from '../providers/api-service/api-service';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    DeploymentsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    DeploymentsPage
  ],
  providers: [ApiService]
})
export class AppModule {}
