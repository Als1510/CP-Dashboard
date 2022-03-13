import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformGuard implements CanActivate{
  
  constructor(
    private _tokenService: TokenService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let platform = this._tokenService.getPlatform()
    if(platform)
      if(platform[Object.keys(platform)[0]])
        return true
    return false;
  }
}
