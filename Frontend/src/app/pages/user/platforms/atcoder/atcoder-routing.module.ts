import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtcoderPage } from './atcoder.page';

const routes: Routes = [
  {
    path: '',
    component: AtcoderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AtcoderPageRoutingModule {}
