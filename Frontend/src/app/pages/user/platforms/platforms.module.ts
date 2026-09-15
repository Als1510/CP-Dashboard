import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlatformsPageRoutingModule } from './platforms-routing.module';

import { SharedModule } from '../../utils/shared.module';
import { PlatformsPage } from './platforms.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PlatformsPageRoutingModule,
    SharedModule
  ],
  declarations: [PlatformsPage]
})
export class PlatformsPageModule { }
