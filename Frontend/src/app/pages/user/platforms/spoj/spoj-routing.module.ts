import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SpojPage } from './spoj.page';

const routes: Routes = [
  {
    path: '',
    component: SpojPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpojPageRoutingModule {}
