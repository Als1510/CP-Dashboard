import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlatformGuard } from 'src/app/guard/platform.guard';
import { CodeforcesComponent } from './codeforces/codeforces.component';

import { PlatformsPage } from './platforms.page';
import { SpojComponent } from './spoj/spoj.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: PlatformsPage },
      { path: 'codeforces', component: CodeforcesComponent },
      { path: 'spoj', component: SpojComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlatformsPageRoutingModule {}
