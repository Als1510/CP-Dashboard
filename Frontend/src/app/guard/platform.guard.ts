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
    let platform = JSON.parse(localStorage.getItem('platform'))
    if(platform)
      if(platform[Object.keys(platform)[0]])
        return true
    return false;
  }
}
