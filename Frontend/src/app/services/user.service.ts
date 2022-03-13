import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  }

  constructor(
    private _http: HttpClient,
    private _env: EnvService
  ) { }

  getPlatforms() {
    return this._http.get(this._env.Mongo_API_URL+'/platform/details', this.httpOptions)
  }

  updatePlatform(platformName, username) {
    return this._http.put(this._env.Mongo_API_URL+'/platform/updateplatform', {platformName, username}, this.httpOptions)
  }

  getUserDetails1(platform, username) {
    return this._http.get(this._env.User_API_URL1+`/${platform}/${username}`, this.httpOptions)
  }
  
  getUserDetails2(platform, username) {
    return this._http.get(this._env.User_API_URL2+`/${platform}/${username}`, this.httpOptions)
  }
}
