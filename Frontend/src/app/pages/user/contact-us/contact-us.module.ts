import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContactUsPageRoutingModule } from './contact-us-routing.module';

import { SharedModule } from '../../utils/shared.module';
import { ContactUsPage } from './contact-us.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ContactUsPageRoutingModule,
    SharedModule
  ],
  declarations: [ContactUsPage]
})
export class ContactUsPageModule { }
