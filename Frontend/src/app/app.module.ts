import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpinterceptorService } from './services/httpinterceptor.service';
import { LoaderComponent } from './pages/utils/loader/loader.component';
import { LoaderService } from './services/loader.service';

@NgModule({
  declarations: [AppComponent, LoaderComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: HttpinterceptorService, multi: true },
    LoaderService
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
