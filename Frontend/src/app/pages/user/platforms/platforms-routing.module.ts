import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlatformGuard } from 'src/app/guard/platform.guard';
import { PlatformsPage } from './platforms.page';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', component: PlatformsPage },
      {
        path: 'codechef',
        loadChildren: () => import('./codechef/codechef.module').then( m => m.CodechefPageModule)
      },
      {
        path: 'codeforces',
        loadChildren: () => import('./codeforces/codeforces.module').then( m => m.CodeforcesPageModule),
        canActivate: [PlatformGuard]
      },
      {
        path: 'spoj',
        loadChildren: () => import('./spoj/spoj.module').then( m => m.SpojPageModule),
        canActivate: [PlatformGuard]
      },
      {
        path: 'atcoder',
        loadChildren: () => import('./atcoder/atcoder.module').then( m => m.AtcoderPageModule),
        canActivate: [PlatformGuard]
      },
      {
        path: 'leetcode',
        loadChildren: () => import('./leetcode/leetcode.module').then( m => m.LeetcodePageModule),
        canActivate: [PlatformGuard]
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlatformsPageRoutingModule {}
