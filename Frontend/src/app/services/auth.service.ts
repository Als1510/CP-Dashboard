import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type':'application/json'})
  }

  constructor(
    private _http: HttpClient,
    private _env: EnvService
  ) { }

  register(name, username, email, password) {
    return this._http.post(this._env.Mongo_API_URL+'/user', {name, username, email, password}, this.httpOptions)
  }

  login(email, password) {
    return this._http.post(this._env.Mongo_API_URL+'/auth', {email, password}, this.httpOptions)
  }

  requestOtp(email) {
    return this._http.post(this._env.Mongo_API_URL+'/validation', {email}, this.httpOptions)
  }

  resetPassword(email, otpCode, password) {
    return this._http.post(this._env.Mongo_API_URL+'/validation/resetpassword', {email, otpCode, password}, this.httpOptions)
  }
}
