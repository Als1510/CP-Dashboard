import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { LocalStorageService } from '../services/localStorage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private _localStorageService: LocalStorageService,
    private _router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    const token = this._localStorageService.getToken();

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const exp = decoded && decoded.exp;

        // exp is in Unix seconds; reject expired tokens
        if (exp && exp < Date.now() / 1000) {
          this._localStorageService.logout();
          this._router.navigate(['login']);
          return false;
        }
        return true;
      } catch (e) {
        // Invalid token - clear it and redirect to login
        this._localStorageService.logout();
        this._router.navigate(['login']);
        return false;
      }
    }

    this._router.navigate(['login'])
    return false
  }
}
