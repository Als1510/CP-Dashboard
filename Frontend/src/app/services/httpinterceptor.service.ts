import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { AlertService } from './alert.service';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';
import { LoaderService } from './loader.service';

const TOKEN_HEADER_KEY = 'x-token';

@Injectable({
  providedIn: 'root'
})
export class HttpinterceptorService {

  token = '';

  constructor(
    private _alertService: AlertService,
    public _router: Router,
    private _tokenService: TokenService,
    private _loaderService: LoaderService
  ) { }

  getToken() {
    this.token = this._tokenService.getToken();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    this.getToken();
    this._loaderService.isLoading.next(true);

    req = req.clone({
      headers: req.headers.set(TOKEN_HEADER_KEY, this.token)
    })

    return next.handle(req).pipe(
      catchError((error) => {
        this._loaderService.isLoading.next(false);
        if(error instanceof HttpErrorResponse) {
          if(Array.isArray(error.error.errors)) {
            this._alertService.presentToast(error.error.errors[0].msg, 'danger')
          } else {
            switch(error.status) {
              case 401:
                this._router.navigate(['login']);
                break;
              case 404:
                this._router.navigate(['400']);
                break;
              case 500:
                this._router.navigate(['500']);
                break;
            }
          }
        }
        return EMPTY;
      })
    )
  }
}