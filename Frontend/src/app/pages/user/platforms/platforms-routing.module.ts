import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlatformGuard } from 'src/app/guard/platform.guard';
import { AtcoderComponent } from './atcoder/atcoder.component';
import { CodeforcesComponent } from './codeforces/codeforces.component';

import { PlatformsPage } from './platforms.page';
import { SpojComponent } from './spoj/spoj.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', component: PlatformsPage },
      { path: 'codeforces', component: CodeforcesComponent, canActivate:[PlatformGuard] },
      { path: 'spoj', component: SpojComponent, canActivate: [PlatformGuard] },
      { path: 'atcoder', component: AtcoderComponent, canActivate: [PlatformGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlatformsPageRoutingModule {}
