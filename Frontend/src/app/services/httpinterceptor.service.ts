import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertService } from './alert.service';
import { LoaderService } from './loader.service';
import { LocalStorageService } from './localStorage.service';

const TOKEN_HEADER_KEY = 'x-token';

@Injectable({
  providedIn: 'root'
})
export class HttpinterceptorService {

  token = '';

  constructor(
    private _alertService: AlertService,
    public _router: Router,
    private _localStorageService: LocalStorageService,
    private _loaderService: LoaderService
  ) { }

  getToken() {
    this.token = this._localStorageService.getToken();
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.getToken();
    this._loaderService.isLoading.next(true);

    req = req.clone({
      headers: req.headers.set(TOKEN_HEADER_KEY, this.token)
    })

    return next.handle(req).pipe(
      catchError((error) => {
        this._loaderService.isLoading.next(false);
        if (error instanceof HttpErrorResponse) {
          const errorBody = error.error;
          const serverMsg = errorBody && (errorBody.details || errorBody.msg || errorBody.message);

          if (Array.isArray(errorBody && errorBody.errors)) {
            this._alertService.presentToast(errorBody.errors[0].msg, 'danger')
          } else if (serverMsg) {
            this._alertService.presentToast(serverMsg, 'danger')
          } else {
            switch (error.status) {
              case 401:
                this._alertService.presentToast('Session expired. Please login again.', 'danger')
                this._router.navigate(['login']);
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