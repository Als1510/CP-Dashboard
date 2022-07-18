import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CodechefPageRoutingModule } from './codechef-routing.module';

import { CodechefPage } from './codechef.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CodechefPageRoutingModule
  ],
  declarations: [CodechefPage]
})
export class CodechefPageModule {}
