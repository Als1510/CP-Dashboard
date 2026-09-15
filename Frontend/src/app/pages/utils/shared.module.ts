import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LoaderComponent } from './loader/loader.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { SocialComponent } from '../auth/social/social.component';
import { MenubuttonComponent } from './menubutton/menubutton.component';

@NgModule({
  declarations: [
    ThemeToggleComponent,
    LoaderComponent,
    SocialComponent,
    MenubuttonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ThemeToggleComponent,
    LoaderComponent,
    SocialComponent,
    MenubuttonComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
