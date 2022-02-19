import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MenubuttonComponent } from './pages/utils/menubutton/menubutton.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: "User",
    component: MenubuttonComponent,
    pathMatch: "prefix",
    children: [
      {
        path: 'login',
        loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/user/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'about',
        loadChildren: () => import('./pages/user/about/about.module').then(m => m.AboutPageModule)
      },
      {
        path: 'platforms',
        loadChildren: () => import('./pages/user/platforms/platforms.module').then(m => m.PlatformsPageModule)
      },
      {
        path: 'contact-us',
        loadChildren: () => import('./pages/user/contact-us/contact-us.module').then(m => m.ContactUsPageModule)
      }
    ]
  },
  {
    path: 'servererror',
    loadChildren: () => import('./pages/error/servererror/servererror.module').then(m => m.ServererrorPageModule)
  },
  {
    path: 'pagenotfound',
    loadChildren: () => import('./pages/error/pagenotfound/pagenotfound.module').then(m => m.PagenotfoundPageModule)
  },
  {
    path: '**',
    redirectTo: 'pagenotfound'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
