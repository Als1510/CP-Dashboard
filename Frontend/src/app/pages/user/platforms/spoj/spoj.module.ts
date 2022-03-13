import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SpojPageRoutingModule } from './spoj-routing.module';

import { SpojPage } from './spoj.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SpojPageRoutingModule
  ],
  declarations: [SpojPage]
})
export class SpojPageModule {}
