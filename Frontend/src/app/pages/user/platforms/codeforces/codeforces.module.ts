import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CodeforcesPageRoutingModule } from './codeforces-routing.module';

import { CodeforcesPage } from './codeforces.page';
 
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CodeforcesPageRoutingModule,
  ],
  declarations: [CodeforcesPage]
})
export class CodeforcesPageModule {}
