import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'servererror',
    loadChildren: () => import('./pages/error/servererror/servererror.module').then( m => m.ServererrorPageModule)
  },
  {
    path: 'pagenotfound',
    loadChildren: () => import('./pages/error/pagenotfound/pagenotfound.module').then( m => m.PagenotfoundPageModule)
  },
  {
    path: '**',
    redirectTo: 'pagenotfound'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
