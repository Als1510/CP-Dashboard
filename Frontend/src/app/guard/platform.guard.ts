import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformGuard implements CanActivate{
  
  constructor(
    private _userService: UserService,
    private _route: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // let platform = childRoute.url[0].path
    console.log(route.params)
    // this._userService.getPlatforms().subscribe(
    //   data => {
    //     let platformData = data['platformData'].platform
    //     for(let prop in platformData) {
    //       if(prop == platform) {
    //         this._loaderService.isLoading.next(false)
    //         return true;
    //       }
    //     }
    //   }
    // )
    return false;
  }
}
