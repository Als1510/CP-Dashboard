import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AtcoderPageRoutingModule } from './atcoder-routing.module';

import { AtcoderPage } from './atcoder.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AtcoderPageRoutingModule
  ],
  declarations: [AtcoderPage]
})
export class AtcoderPageModule {}
