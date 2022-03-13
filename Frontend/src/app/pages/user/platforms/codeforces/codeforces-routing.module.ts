import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CodeforcesPage } from './codeforces.page';

const routes: Routes = [
  {
    path: '',
    component: CodeforcesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodeforcesPageRoutingModule {}
