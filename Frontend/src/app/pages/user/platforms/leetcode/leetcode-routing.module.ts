import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeetcodePage } from './leetcode.page';

const routes: Routes = [
  {
    path: '',
    component: LeetcodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeetcodePageRoutingModule {}
