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
    loadChildren: () => import('./pages/user/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: "User",
    component: MenubuttonComponent,
    pathMatch: "prefix",
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/user/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'platforms',
        loadChildren: () => import('./pages/user/platforms/platforms.module').then(m => m.PlatformsPageModule)
      },
      {
        path: 'about',
        loadChildren: () => import('./pages/user/about/about.module').then(m => m.AboutPageModule)
      },
      {
        path: 'contact-us',
        loadChildren: () => import('./pages/user/contact-us/contact-us.module').then(m => m.ContactUsPageModule)
      },
      {
        path: 'resources',
        loadChildren: () => import('./pages/user/resources/resources.module').then( m => m.ResourcesPageModule)
      },
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
