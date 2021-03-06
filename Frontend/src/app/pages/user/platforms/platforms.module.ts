import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlatformsPageRoutingModule } from './platforms-routing.module';

import { PlatformsPage } from './platforms.page';
import { MenubuttonComponent } from '../../utils/menubutton/menubutton.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PlatformsPageRoutingModule
  ],
  declarations: [PlatformsPage, MenubuttonComponent], 
})
export class PlatformsPageModule {}
