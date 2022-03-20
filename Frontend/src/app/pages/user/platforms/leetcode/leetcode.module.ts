import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeetcodePageRoutingModule } from './leetcode-routing.module';

import { LeetcodePage } from './leetcode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeetcodePageRoutingModule
  ],
  declarations: [LeetcodePage]
})
export class LeetcodePageModule {}
